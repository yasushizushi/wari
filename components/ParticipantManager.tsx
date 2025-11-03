
import React, { useState } from 'react';
import { SettlementUnit, Participant, Role, SettlementUnitType } from '../types';
import AddParticipantModal from './modals/AddParticipantModal';

interface ParticipantManagerProps {
  settlementUnits: SettlementUnit[];
  onAddSettlementUnit: (unit: SettlementUnit) => void;
}

const PersonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const GroupIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
    </svg>
);

const ParticipantManager: React.FC<ParticipantManagerProps> = ({ settlementUnits, onAddSettlementUnit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-dark">参加者</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors text-sm font-semibold"
        >
          追加
        </button>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {settlementUnits.length === 0 ? (
          <p className="text-slate-500 text-center py-4">参加者を追加してください。</p>
        ) : (
          settlementUnits.map(unit => (
            <div key={unit.id} className="border border-slate-200 rounded-lg p-3">
              <div className="font-semibold text-dark flex items-center">
                 {unit.type === 'family' ? <GroupIcon /> : <PersonIcon />}
                 {unit.name}
              </div>
              <ul className="pl-7 mt-1 text-sm text-slate-600">
                {unit.members.map(member => (
                  <li key={member.id} className="flex justify-between">
                    <span>{member.name}</span>
                    <span className="text-slate-400">{member.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
      
      {isModalOpen && (
        <AddParticipantModal
          onClose={() => setIsModalOpen(false)}
          onAdd={onAddSettlementUnit}
        />
      )}
    </div>
  );
};

export default ParticipantManager;
