import React, { useState } from 'react';
import { Participant, SettlementUnit, Expense, Transaction, Balance } from '../types';
import Header from './Header';
import ParticipantManager from './ParticipantManager';
import ExpenseManager from './ExpenseManager';
import ResultsDisplay from './ResultsDisplay';

interface DashboardProps {
  eventName: string;
  settlementUnits: SettlementUnit[];
  participants: Participant[];
  expenses: Expense[];
  balances: Balance[];
  transactions: Transaction[];
  onAddSettlementUnit: (unit: SettlementUnit) => void;
  onAddExpense: (expense: Expense) => void;
  onToggleTransaction: (index: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  eventName,
  settlementUnits,
  participants,
  expenses,
  balances,
  transactions,
  onAddSettlementUnit,
  onAddExpense,
  onToggleTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<'results' | 'participants' | 'expenses'>('results');

  const tabItems = [
    { id: 'results', label: '清算結果' },
    { id: 'participants', label: '参加者' },
    { id: 'expenses', label: '支出' },
  ];

  return (
    <div className="min-h-screen bg-light">
      <Header 
        eventName={eventName}
        settlementUnits={settlementUnits}
        expenses={expenses}
      />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {/* Mobile Tabs */}
        <div className="lg:hidden mb-4">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {tabItems.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors focus:outline-none`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ResultsDisplay 
              balances={balances} 
              transactions={transactions} 
              onToggleTransaction={onToggleTransaction}
            />
          </div>
          <div className="lg:col-span-1 space-y-8">
            <ParticipantManager 
              settlementUnits={settlementUnits} 
              onAddSettlementUnit={onAddSettlementUnit}
            />
            <ExpenseManager 
              settlementUnits={settlementUnits}
              participants={participants}
              expenses={expenses}
              onAddExpense={onAddExpense}
            />
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden space-y-8">
          {activeTab === 'results' && (
            <ResultsDisplay 
              balances={balances} 
              transactions={transactions} 
              onToggleTransaction={onToggleTransaction}
            />
          )}
          {activeTab === 'participants' && (
            <ParticipantManager 
              settlementUnits={settlementUnits} 
              onAddSettlementUnit={onAddSettlementUnit}
            />
          )}
          {activeTab === 'expenses' && (
             <ExpenseManager 
              settlementUnits={settlementUnits}
              participants={participants}
              expenses={expenses}
              onAddExpense={onAddExpense}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;