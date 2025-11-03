import React, { useState } from 'react';
import { SettlementUnit, Expense } from '../types';

interface HeaderProps {
  eventName: string;
  settlementUnits: SettlementUnit[];
  expenses: Expense[];
}

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
);

const LineIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
       <path d="M16.32,15.17a1.1,1.1,0,0,1,.46-.17,1.25,1.25,0,0,1,1.07.27,1.43,1.43,0,0,1,.4,1.13,1.38,1.38,0,0,1-.41,1.12,1.26,1.26,0,0,1-1.09.28,1.15,1.15,0,0,1-.83-.43,1.3,1.3,0,0,1-.31-1,1.4,1.4,0,0,1,.15-1.22Zm-4.48-1.7a1.36,1.36,0,0,1,.59.27V12a1,1,0,0,0,.08-.42,1.23,1.23,0,0,0-.24-1,1.25,1.25,0,0,0-1-.38,1.75,1.75,0,0,0-1.2.53v-.7H8.51v4.18h1.56v-2.3a.69.69,0,0,1,.52-.69.57.57,0,0,1,.58.62v2.37h1.56V14.12a2.31,2.31,0,0,0-.4-1.65Zm-4.66.5h1.56V9.66H8.74v1.45H7.18V9.66H5.62V15h1.56Zm12.43-8.8a9.6,9.6,0,1,0-9.6,9.6A9.6,9.6,0,0,0,19.61,5.17Z"/>
    </svg>
);

const LinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ eventName, settlementUnits, expenses }) => {
  const [copyStatus, setCopyStatus] = useState('');

  const generateShareUrl = () => {
    const dataToShare = {
      eventName,
      settlementUnits,
      expenses,
    };
    const encodedData = btoa(JSON.stringify(dataToShare));
    return `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
  };

  const handleCopyToClipboard = () => {
    const url = generateShareUrl();
    navigator.clipboard.writeText(url).then(() => {
        setCopyStatus('コピーしました！');
        setTimeout(() => setCopyStatus(''), 2000);
    }).catch(err => {
        setCopyStatus('コピーに失敗しました');
        console.error('Failed to copy: ', err);
        setTimeout(() => setCopyStatus(''), 2000);
    });
  };

  const handleShareOnLine = () => {
    const url = generateShareUrl();
    const message = encodeURIComponent(`「${eventName}」の割り勘を共有します！\n${url}`);
    const lineUrl = `https://line.me/R/msg/text/?${message}`;
    window.open(lineUrl, '_blank');
  };

  const handleGoHome = () => {
    window.location.href = window.location.origin;
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div>
            <h1 className="text-xl md:text-2xl font-bold text-primary font-yusei">{eventName}</h1>
            <p className="text-sm text-slate-500 font-yusei">Wari by Co-Sato</p>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={handleCopyToClipboard} className="relative flex items-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-lg transition-colors text-sm">
                <LinkIcon/>
                <span className="ml-2 hidden sm:inline">リンクをコピー</span>
                 {copyStatus && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded py-1 px-2">{copyStatus}</span>}
            </button>
            <button onClick={handleShareOnLine} className="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm">
                 <LineIcon />
                 <span className="ml-2 hidden sm:inline">LINEで共有</span>
            </button>
             <button onClick={handleGoHome} className="flex items-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-lg transition-colors text-sm">
                <HomeIcon />
                <span className="ml-2 hidden sm:inline">トップへ</span>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;