
import React, { useState } from 'react';
import { EndingType, Language } from '../types';
import { ACHIEVEMENTS, ACHIEVEMENTS_EN, UI_TEXT } from '../constants';

interface StartScreenProps {
  onNewGame: () => void;
  onOpenLoadMenu: () => void;
  hasSaves: boolean;
  unlockedAchievements: EndingType[];
  lang: Language;
  setLang: (l: Language) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onNewGame, onOpenLoadMenu, hasSaves, unlockedAchievements, lang, setLang }) => {
  const [showAchievements, setShowAchievements] = useState(false);
  const T = UI_TEXT[lang];
  const ACH_LIST = lang === 'en' ? ACHIEVEMENTS_EN : ACHIEVEMENTS;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#050505] text-[#e5e5e5] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-red-950/20 to-transparent pointer-events-none"></div>
      
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
         <button onClick={() => setLang('zh')} className={`px-2 py-1 text-xs border ${lang === 'zh' ? 'border-amber-600 text-amber-500 bg-amber-900/20' : 'border-neutral-700 text-neutral-500'}`}>中文</button>
         <button onClick={() => setLang('en')} className={`px-2 py-1 text-xs border ${lang === 'en' ? 'border-amber-600 text-amber-500 bg-amber-900/20' : 'border-neutral-700 text-neutral-500'}`}>EN</button>
      </div>

      <div className="z-10 flex flex-col items-center mb-12 sm:mb-16 animate-fade-in select-none w-full max-w-lg">
            <div className="flex items-center gap-3 mb-6 opacity-90">
                <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-red-800"></div>
                <div className="text-red-600 text-xs sm:text-sm tracking-[0.4em] font-bold font-yahei text-shadow-sm">
                    {lang === 'en' ? '1937 · SHANGHAI' : '一九三七 · 上海'}
                </div>
                <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-red-800"></div>
            </div>

            <h1 className="relative text-7xl sm:text-9xl font-bold font-serif text-neutral-200 tracking-widest mb-4 drop-shadow-2xl transform scale-y-110">
                <span className="absolute top-1 left-2 text-red-900/30 blur-[2px] select-none -z-10 pointer-events-none">孤军</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-400">孤军</span>
            </h1>

            <div className="w-full flex flex-col items-center gap-2 mt-2">
                <h2 className="text-2xl sm:text-4xl font-serif text-neutral-400 tracking-[0.5em] uppercase pl-2">
                    {lang === 'en' ? 'LONE ARMY' : '四行仓库'}
                </h2>
                <div className="w-3/4 h-[1px] bg-gradient-to-r from-transparent via-neutral-700 to-transparent mt-1"></div>
            </div>

            <div className="mt-6 px-6 py-1.5 bg-red-950/20 border-x border-red-900/20 rounded-sm">
                <div className="text-xs sm:text-sm text-neutral-500 font-yahei font-bold tracking-[0.3em] uppercase text-center">
                    {lang === 'en' ? 'THE EIGHT HUNDRED' : '八百壮士'} <span className="text-red-800 mx-1">·</span> {lang === 'en' ? 'LAST STAND' : '民族之魂'}
                </div>
            </div>
      </div>

      <div className="z-10 flex flex-col gap-4 w-full max-w-xs">
            <button onClick={onNewGame} className="w-full py-4 bg-red-950/20 border border-red-900/40 hover:bg-red-900/30 hover:border-red-600 text-neutral-200 font-bold tracking-widest transition-all duration-300 shadow-lg relative overflow-hidden font-yahei group">
                <span className="relative z-10 flex items-center justify-center gap-2 pointer-events-none">
                    <span className="w-1.5 h-1.5 bg-red-600 rotate-45"></span>
                    {T.newGame}
                    <span className="w-1.5 h-1.5 bg-red-600 rotate-45"></span>
                </span>
            </button>

            <button onClick={onOpenLoadMenu} disabled={!hasSaves} className={`w-full py-3 bg-neutral-900/80 border border-neutral-700 text-amber-500 font-bold tracking-widest transition-all duration-300 shadow-lg flex flex-col items-center gap-1 font-yahei ${hasSaves ? 'hover:bg-neutral-800 hover:border-amber-700/50' : 'opacity-40 cursor-not-allowed grayscale'}`}>
                <span>{T.loadGame}</span>
            </button>

            <button onClick={() => setShowAchievements(true)} className="w-full py-2 bg-transparent text-neutral-600 hover:text-neutral-400 transition-colors text-xs tracking-wider font-yahei flex justify-center items-center gap-1">
                <span>🎖</span> {T.achievements} ({unlockedAchievements.length}/{ACH_LIST.length})
            </button>
            
            <div className="text-[10px] text-neutral-700 text-center mt-4 font-yahei leading-relaxed select-none">
                {T.version}
            </div>
      </div>
      
      {showAchievements && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col p-4 sm:p-8 animate-fade-in text-neutral-200">
            <div className="max-w-5xl mx-auto w-full flex flex-col h-full border border-neutral-800 bg-[#0a0a0a] rounded shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-neutral-800 bg-neutral-900 z-10">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">🎖</span>
                        <div>
                            <h2 className="text-2xl font-bold font-serif tracking-[0.2em] text-amber-500">{T.achievements}</h2>
                        </div>
                    </div>
                    <button onClick={() => setShowAchievements(false)} className="text-neutral-500 hover:text-white px-2 text-2xl">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar z-10 bg-[#050505]/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ACH_LIST.map((ach) => {
                            const isUnlocked = unlockedAchievements.includes(ach.id);
                            return (
                                <div key={ach.id} className={`relative p-5 border rounded transition-all duration-300 group overflow-hidden flex gap-5 items-start ${isUnlocked ? 'bg-gradient-to-br from-neutral-900 to-neutral-950 border-amber-800/40' : 'bg-black/40 border-neutral-800 opacity-60 grayscale'}`}>
                                    <div className={`text-4xl sm:text-5xl shrink-0 flex items-center justify-center w-20 h-20 rounded bg-[#0a0a0a] border border-neutral-800 shadow-inner ${isUnlocked ? 'animate-pulse-slow text-shadow-gold' : ''}`}>{isUnlocked ? ach.icon : '🔒'}</div>
                                    <div className="flex-1 min-w-0 pt-1">
                                        <h3 className={`font-bold font-serif tracking-widest text-lg ${isUnlocked ? 'text-amber-100' : 'text-neutral-600'}`}>{isUnlocked ? ach.title : (ach.isSecret ? '???' : ach.title)}</h3>
                                        <p className={`text-xs leading-relaxed font-yahei ${isUnlocked ? 'text-neutral-400' : 'text-neutral-700'}`}>{isUnlocked ? ach.desc : (ach.isSecret ? '???' : ach.desc)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default StartScreen;
