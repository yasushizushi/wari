
import React, { useState } from 'react';
import { Expense, Participant, SettlementUnit } from '../types';
import AddExpenseModal from './modals/AddExpenseModal';

interface ExpenseManagerProps {
  expenses: Expense[];
  settlementUnits: SettlementUnit[];
  participants: Participant[];
  onAddExpense: (expense: Expense) => void;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({ expenses, settlementUnits, participants, onAddExpense }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-dark">支出</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors text-sm font-semibold disabled:bg-slate-300"
          disabled={settlementUnits.length === 0}
        >
          追加
        </button>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {expenses.length === 0 ? (
          <p className="text-slate-500 text-center py-4">支出を追加してください。</p>
        ) : (
          [...expenses].reverse().map(expense => {
            const payer = settlementUnits.find(u => u.id === expense.payerId);
            return (
              <div key={expense.id} className="flex justify-between items-center border-b border-slate-100 py-2">
                <div>
                  <p className="font-medium text-dark">{expense.name}</p>
                  <p className="text-sm text-slate-500">支払者: {payer?.name || 'N/A'}</p>
                </div>
                <p className="font-semibold text-primary">{expense.amount.toLocaleString()}円</p>
              </div>
            );
          })
        )}
      </div>
       {isModalOpen && (
        <AddExpenseModal
          onClose={() => setIsModalOpen(false)}
          onAdd={onAddExpense}
          settlementUnits={settlementUnits}
          participants={participants}
        />
      )}
    </div>
  );
};

export default ExpenseManager;
