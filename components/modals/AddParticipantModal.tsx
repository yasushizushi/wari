import React, { useState } from 'react';
import { SettlementUnit, Participant, Role, SettlementUnitType } from '../../types';

interface AddParticipantModalProps {
  onClose: () => void;
  onAdd: (unit: SettlementUnit) => void;
}

const AddParticipantModal: React.FC<AddParticipantModalProps> = ({ onClose, onAdd }) => {
  const [unitType, setUnitType] = useState<SettlementUnitType>('family');
  const [unitName, setUnitName] = useState('');
  const [individualRole, setIndividualRole] = useState<Role>(Role.StudentStaff);
  const [familyName, setFamilyName] = useState('');
  const [members, setMembers] = useState<{ name: string; role: Role }[]>([{ name: '', role: Role.Adult }]);

  const handleAddMember = () => {
    setMembers([...members, { name: '', role: Role.Child }]);
  };

  const handleMemberChange = (index: number, field: 'name' | 'role', value: string) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
  };
  
  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const unitId = `unit-${Date.now()}`;
    let newUnit: SettlementUnit;

    if (unitType === 'individual') {
        if (!unitName.trim()) return;
        const participantId = `p-${Date.now()}`;
        const participant: Participant = { id: participantId, name: unitName, role: individualRole, unitId };
        newUnit = { id: unitId, name: unitName, type: 'individual', members: [participant] };
    } else { // family
        if (!familyName.trim() || members.some(m => !m.name.trim())) return;
        const familyMembers: Participant[] = members.map((m, i) => ({
            id: `p-${Date.now()}-${i}`,
            name: m.name,
            role: m.role,
            unitId
        }));
        newUnit = { id: unitId, name: familyName, type: 'family', members: familyMembers };
    }
    
    onAdd(newUnit);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
        <form onSubmit={handleSubmit}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-dark">参加者の追加</h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">&times;</button>
                </div>
                <div className="mb-4">
                    <div className="flex border border-slate-200 rounded-lg p-1">
                        <button type="button" onClick={() => setUnitType('family')} className={`w-1/2 py-2 rounded-md transition-colors ${unitType === 'family' ? 'bg-primary text-white' : 'text-slate-600'}`}>家族</button>
                        <button type="button" onClick={() => setUnitType('individual')} className={`w-1/2 py-2 rounded-md transition-colors ${unitType === 'individual' ? 'bg-primary text-white' : 'text-slate-600'}`}>個人</button>
                    </div>
                </div>

                {unitType === 'individual' && (
                    <div className="space-y-4">
                        <input type="text" placeholder="氏名" value={unitName} onChange={e => setUnitName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-colors duration-200" required />
                        <select value={individualRole} onChange={e => setIndividualRole(e.target.value as Role)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-colors duration-200">
                            <option value={Role.StudentStaff}>学生スタッフ</option>
                            <option value={Role.Manager}>管理人</option>
                        </select>
                    </div>
                )}
                
                {unitType === 'family' && (
                    <div className="space-y-4">
                        <input type="text" placeholder="家族名 (例: 佐藤家)" value={familyName} onChange={e => setFamilyName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-colors duration-200" required />
                        <h4 className="text-lg font-semibold border-b pb-2">メンバー</h4>
                        {members.map((member, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input type="text" placeholder="名前" value={member.name} onChange={e => handleMemberChange(index, 'name', e.target.value)} className="flex-grow px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-colors duration-200" required />
                                <select value={member.role} onChange={e => handleMemberChange(index, 'role', e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-colors duration-200">
                                    <option value={Role.Adult}>大人</option>
                                    <option value={Role.Child}>子ども</option>
                                </select>
                                <button type="button" onClick={() => handleRemoveMember(index)} disabled={members.length <= 1} className="text-red-500 disabled:text-slate-300 p-2">&times;</button>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddMember} className="text-sm text-primary font-semibold">+ メンバーを追加</button>
                    </div>
                )}
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end">
                <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 transition-colors">保存</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddParticipantModal;