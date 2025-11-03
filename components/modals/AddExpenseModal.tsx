import React, { useState } from 'react';
import { Expense, SettlementUnit, Participant, Role, ROLE_RATIOS } from '../../types';

interface AddExpenseModalProps {
  onClose: () => void;
  onAdd: (expense: Expense) => void;
  settlementUnits: SettlementUnit[];
  participants: Participant[];
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onClose, onAdd, settlementUnits, participants }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [payerId, setPayerId] = useState<string>(settlementUnits[0]?.id || '');
  const [participantIds, setParticipantIds] = useState<string[]>(participants.map(p => p.id));
  const [showRatios, setShowRatios] = useState(false);
  const [ratioOverrides, setRatioOverrides] = useState<{ [key: string]: number }>(
      Object.fromEntries(Object.entries(ROLE_RATIOS).map(([role, ratio])=> [role, ratio * 100]))
  );

  const handleParticipantCheck = (id: string) => {
    setParticipantIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (participantIds.length === participants.length) {
      setParticipantIds([]);
    } else {
      setParticipantIds(participants.map(p => p.id));
    }
  };
  
  const handleRatioChange = (role: Role, value: string) => {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >=0 && numValue <= 200) {
          setRatioOverrides(prev => ({...prev, [role]: numValue}));
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: The `amount` state can be an empty string, which causes a type error when comparing with a number.
    // Coercing `amount` to a number ensures the comparison is always valid.
    if (name.trim() && Number(amount) > 0 && payerId && participantIds.length > 0) {
      onAdd({
        id: `exp-${Date.now()}`,
        name,
        amount: Number(amount),
        payerId,
        participantIds,
        ratioOverrides: Object.fromEntries(Object.entries(ratioOverrides).map(([role, ratio])=> [role, ratio / 100])),
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
        <form onSubmit={handleSubmit}>
            <div className="p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-dark">支出の追加</h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">&times;</button>
                </div>
                <div className="space-y-4">
                    <input type="text" placeholder="項目名 (例: BBQ食材費)" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-colors duration-200" required />
                    <div className="flex space-x-2">
                        <input type="number" placeholder="金額" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))} min="1" className="w-2/3 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-colors duration-200" required />
                        <select value={payerId} onChange={e => setPayerId(e.target.value)} className="w-1/3 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-colors duration-200">
                            {settlementUnits.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-lg font-semibold">対象者</h4>
                             <button type="button" onClick={handleSelectAll} className="text-sm text-primary font-semibold">
                                {participantIds.length === participants.length ? '全員選択解除' : '全員選択'}
                             </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border p-3 rounded-lg max-h-40 overflow-y-auto">
                            {participants.map(p => (
                                <label key={p.id} className="flex items-center space-x-2 text-sm">
                                    <input type="checkbox" checked={participantIds.includes(p.id)} onChange={() => handleParticipantCheck(p.id)} className="rounded text-primary focus:ring-primary" />
                                    <span>{p.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                     <div>
                        <button type="button" onClick={() => setShowRatios(!showRatios)} className="text-sm text-primary font-semibold">
                           {showRatios ? '負担率を隠す' : '役割別負担率を調整'}
                        </button>
                        {showRatios && (
                            <div className="mt-2 space-y-2 border p-3 rounded-lg bg-slate-50">
                                {Object.values(Role).map(role => (
                                    <div key={role} className="flex items-center justify-between">
                                        <label className="text-sm">{role}</label>
                                        <div className="flex items-center space-x-2">
                                            <input type="range" min="0" max="200" value={ratioOverrides[role] || 100} onChange={e => handleRatioChange(role, e.target.value)} className="w-32"/>
                                            <input type="number" value={ratioOverrides[role] || 100} onChange={e => handleRatioChange(role, e.target.value)} className="w-16 text-center bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200" />
                                            <span>%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end">
                <button type="submit" className="bg-secondary text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-colors">追加</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;