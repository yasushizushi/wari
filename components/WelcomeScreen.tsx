import React, { useState } from 'react';

interface WelcomeScreenProps {
  onCreateGroup: (name: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateGroup }) => {
  const [eventName, setEventName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventName.trim()) {
      onCreateGroup(eventName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2 font-yusei">Wari by Co-Sato</h1>
        <p className="text-slate-500 mb-6">イベント名を入力して、割り勘精算を始めましょう。</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="例: 夏休み旅行 2024"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-colors duration-200"
            required
          />
          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors disabled:bg-slate-300"
            disabled={!eventName.trim()}
          >
            グループを作成
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomeScreen;