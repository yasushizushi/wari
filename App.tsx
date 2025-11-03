
import React, { useState, useMemo, useEffect } from 'react';
import { Participant, SettlementUnit, Expense, Transaction, Balance, Role } from './types';
import { calculateSettlement } from './services/settlementService';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [eventName, setEventName] = useState<string | null>(null);
  const [settlementUnits, setSettlementUnits] = useState<SettlementUnit[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const data = urlParams.get('data');
      if (data) {
        const decodedData = JSON.parse(atob(data));
        if (decodedData.eventName && decodedData.settlementUnits && decodedData.expenses) {
          setEventName(decodedData.eventName);
          setSettlementUnits(decodedData.settlementUnits);
          setExpenses(decodedData.expenses);
        }
      }
    } catch (error) {
      console.error("Failed to load data from URL:", error);
      // Fallback to normal flow if data is invalid
    } finally {
        setIsDataLoaded(true);
    }
  }, []);

  const participants = useMemo(() => {
    return settlementUnits.flatMap(unit => unit.members);
  }, [settlementUnits]);

  const { balances, transactions } = useMemo(() => {
    return calculateSettlement(settlementUnits, expenses);
  }, [settlementUnits, expenses]);

  const handleCreateGroup = (name: string) => {
    setEventName(name);
  };

  const addSettlementUnit = (unit: SettlementUnit) => {
    setSettlementUnits(prev => [...prev, unit]);
  };

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [...prev, expense]);
  };

  const toggleTransactionSettled = (index: number) => {
    setTransactions(prev => {
      const newTransactions = [...prev];
      newTransactions[index].settled = !newTransactions[index].settled;
      return newTransactions;
    });
  };
  
  const [transactionState, setTransactions] = useState<Transaction[]>([]);
  
  React.useEffect(() => {
    setTransactions(transactions);
  }, [transactions]);

  if (!isDataLoaded) {
      return null; // or a loading spinner
  }

  if (!eventName) {
    return <WelcomeScreen onCreateGroup={handleCreateGroup} />;
  }

  return (
    <Dashboard
      eventName={eventName}
      settlementUnits={settlementUnits}
      participants={participants}
      expenses={expenses}
      balances={balances}
      transactions={transactionState}
      onAddSettlementUnit={addSettlementUnit}
      onAddExpense={addExpense}
      onToggleTransaction={toggleTransactionSettled}
    />
  );
};

export default App;