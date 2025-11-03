
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, Balance } from '../types';

interface ResultsDisplayProps {
  transactions: Transaction[];
  balances: Balance[];
  onToggleTransaction: (index: number) => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ transactions, balances, onToggleTransaction }) => {

  const chartData = balances.map(b => ({
    name: b.unitName,
    支払額: Math.round(b.paid),
    負担額: Math.round(b.share),
    差額: Math.round(b.balance),
  }));

  return (
    <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-dark mb-4">清算結果</h2>
            <div className="space-y-3">
                {transactions.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">参加者と支出を登録すると、清算結果が表示されます。</p>
                ) : (
                    transactions.map((t, index) => (
                        <div key={index} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${t.settled ? 'bg-slate-100 text-slate-400' : 'bg-orange-50'}`}>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={t.settled}
                                    onChange={() => onToggleTransaction(index)}
                                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary mr-4"
                                />
                                <div className={`flex items-center space-x-2 ${t.settled ? 'line-through' : ''}`}>
                                    <span className="font-medium text-slate-700">{t.from}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                    <span className="font-medium text-slate-700">{t.to}</span>
                                </div>
                            </div>
                            <span className={`font-bold text-lg ${t.settled ? 'text-slate-400' : 'text-orange-600'}`}>{t.amount.toLocaleString()}円</span>
                        </div>
                    ))
                )}
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-dark mb-4">バランス概要</h2>
            {balances.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `${value.toLocaleString()}円`} />
                            <Legend />
                            <Bar dataKey="支払額" fill="#14b8a6" />
                            <Bar dataKey="負担額" fill="#06b6d4" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                 <p className="text-slate-500 text-center py-4">データがありません。</p>
            )}
        </div>
    </div>
  );
};

export default ResultsDisplay;
