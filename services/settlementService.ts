
import { SettlementUnit, Expense, Transaction, Balance, Participant, ROLE_RATIOS } from '../types';

interface CalculationResult {
  balances: Balance[];
  transactions: Transaction[];
}

export const calculateSettlement = (
  units: SettlementUnit[],
  expenses: Expense[]
): CalculationResult => {
  if (units.length === 0) {
    return { balances: [], transactions: [] };
  }

  const allParticipants = units.flatMap(u => u.members);
  const participantMap = new Map<string, Participant>(allParticipants.map(p => [p.id, p]));
  const unitMap = new Map<string, SettlementUnit>(units.map(u => [u.id, u]));

  const balancesMap = new Map<string, { paid: number; share: number }>(
    units.map(u => [u.id, { paid: 0, share: 0 }])
  );

  expenses.forEach(expense => {
    // Add to payer's paid amount
    const payerBalance = balancesMap.get(expense.payerId);
    if (payerBalance) {
      payerBalance.paid += expense.amount;
    }

    // Calculate and distribute share
    const expenseParticipants = expense.participantIds
      .map(id => participantMap.get(id))
      .filter((p): p is Participant => !!p);

    if (expenseParticipants.length === 0) return;

    const totalRatioPoints = expenseParticipants.reduce((sum, p) => {
      const ratio = expense.ratioOverrides?.[p.role] ?? ROLE_RATIOS[p.role];
      return sum + ratio;
    }, 0);
    
    if (totalRatioPoints === 0) return;

    expenseParticipants.forEach(p => {
      const unitBalance = balancesMap.get(p.unitId);
      if (unitBalance) {
        const ratio = expense.ratioOverrides?.[p.role] ?? ROLE_RATIOS[p.role];
        const individualShare = (expense.amount * ratio) / totalRatioPoints;
        unitBalance.share += individualShare;
      }
    });
  });

  const finalBalances: Balance[] = units.map(unit => {
    const { paid, share } = balancesMap.get(unit.id) || { paid: 0, share: 0 };
    return {
      unitId: unit.id,
      unitName: unit.name,
      paid,
      share,
      balance: paid - share,
    };
  });
  
  // Settle up algorithm
  const transactions: Transaction[] = [];
  const debtors = finalBalances.filter(b => b.balance < 0).map(b => ({ ...b }));
  const creditors = finalBalances.filter(b => b.balance > 0).map(b => ({ ...b }));
  
  debtors.sort((a, b) => a.balance - b.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  let debtorIndex = 0;
  let creditorIndex = 0;

  while(debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amountToSettle = Math.min(-debtor.balance, creditor.balance);

    if (amountToSettle > 0.01) { // Avoid tiny transactions due to float precision
      transactions.push({
        from: debtor.unitName,
        to: creditor.unitName,
        amount: Math.round(amountToSettle),
        settled: false,
      });

      debtor.balance += amountToSettle;
      creditor.balance -= amountToSettle;
    }

    if (Math.abs(debtor.balance) < 0.01) {
      debtorIndex++;
    }
    if (Math.abs(creditor.balance) < 0.01) {
      creditorIndex++;
    }
  }

  return { balances: finalBalances, transactions };
};
