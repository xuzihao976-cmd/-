
import React, { useState } from 'react';
import { EndingType } from '../types';
import { ACHIEVEMENTS } from '../constants';

interface StartScreenProps {
  onNewGame: () => void;
  onOpenLoadMenu: () => void;
  hasSaves: boolean;
  unlockedAchievements: EndingType[];
}

const StartScreen: React.FC<StartScreenProps> = ({ onNewGame, onOpenLoadMenu, hasSaves, unlockedAchievements }) => {
  const [showAchievements, setShowAchievements] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#050505] text-[#e5e5e5] p-6 relative overflow-hidden">
      {/* Atmospheric Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-red-950/20 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-t from-neutral-900/50 to-transparent pointer-events-none"></div>
      
      {/* Main Menu Content */}
      <div className="z-10 flex flex-col items-center mb-12 sm:mb-16 animate-fade-in select-none w-full max-w-lg">
            
            {/* Top Date Stamp */}
            <div className="flex items-center gap-3 mb-6 opacity-90">
                <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-red-800"></div>
                <div className="text-red-600 text-xs sm:text-sm tracking-[0.4em] font-bold font-yahei text-shadow-sm">
                    一九三七 · 上海
                </div>
                <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-red-800"></div>
            </div>

            {/* Main Title - Massive & Gritty */}
            <h1 className="relative text-7xl sm:text-9xl font-bold font-serif text-neutral-200 tracking-widest mb-4 drop-shadow-2xl transform scale-y-110">
                {/* Back Blood Shadow Layer */}
                <span className="absolute top-1 left-2 text-red-900/30 blur-[2px] select-none -z-10 pointer-events-none">
                    孤军
                </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-400">
                    孤军
                </span>
            </h1>

            {/* Subtitle Container */}
            <div className="w-full flex flex-col items-center gap-2 mt-2">
                <h2 className="text-2xl sm:text-4xl font-serif text-neutral-400 tracking-[0.5em] uppercase pl-2">
                    四行仓库
                </h2>
                {/* Decorative Line */}
                <div className="w-3/4 h-[1px] bg-gradient-to-r from-transparent via-neutral-700 to-transparent mt-1"></div>
            </div>

            {/* Bottom Tagline - Badge Style */}
            <div className="mt-6 px-6 py-1.5 bg-red-950/20 border-x border-red-900/20 rounded-sm">
                <div className="text-xs sm:text-sm text-neutral-500 font-yahei font-bold tracking-[0.3em] uppercase text-center">
                    八百壮士 <span className="text-red-800 mx-1">·</span> 民族之魂
                </div>
            </div>
      </div>

      {/* Action Buttons */}
      <div className="z-10 flex flex-col gap-4 w-full max-w-xs">
            
            <button
            onClick={onNewGame}
            className="w-full py-4 bg-red-950/20 border border-red-900/40 hover:bg-red-900/30 hover:border-red-600 text-neutral-200 font-bold tracking-widest transition-all duration-300 shadow-lg transform hover:scale-[1.02] active:scale-95 relative overflow-hidden font-yahei group"
            >
                <div className="absolute inset-0 bg-red-900/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-600 rotate-45"></span>
                    开始新战役
                    <span className="w-1.5 h-1.5 bg-red-600 rotate-45"></span>
                </span>
            </button>

            <button
            onClick={onOpenLoadMenu}
            disabled={!hasSaves}
            className={`w-full py-3 bg-neutral-900/80 border border-neutral-700 text-amber-500 font-bold tracking-widest transition-all duration-300 shadow-lg flex flex-col items-center gap-1 font-yahei ${hasSaves ? 'hover:bg-neutral-800 hover:border-amber-700/50 transform hover:scale-[1.02] active:scale-95' : 'opacity-40 cursor-not-allowed grayscale'}`}
            >
                <span>读取作战记录</span>
            </button>

            <button
                onClick={() => setShowAchievements(true)}
                className="w-full py-2 bg-transparent text-neutral-600 hover:text-neutral-400 transition-colors text-xs tracking-wider font-yahei flex justify-center items-center gap-1"
            >
                <span>🎖</span> 查看勋章墙 ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
            </button>
            
            <div className="text-[10px] text-neutral-700 text-center mt-4 font-yahei leading-relaxed select-none">
                v1.4.1 | 沉浸式历史体验
            </div>
      </div>
      
      {/* Achievements Full Screen Modal */}
      {showAchievements && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col p-4 sm:p-8 animate-fade-in text-neutral-200">
            <div className="max-w-5xl mx-auto w-full flex flex-col h-full border border-neutral-800 bg-[#0a0a0a] rounded shadow-2xl relative overflow-hidden">
                {/* Background Texture */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-neutral-800 bg-neutral-900 z-10">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">🎖</span>
                        <div>
                            <h2 className="text-2xl font-bold font-serif tracking-[0.2em] text-amber-500">荣誉勋章墙</h2>
                            <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mt-1">HALL OF VALOR</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowAchievements(false)} 
                        className="text-neutral-500 hover:text-white px-2 text-2xl transition-colors w-10 h-10 flex items-center justify-center border border-transparent hover:border-neutral-700 rounded"
                    >
                        ✕
                    </button>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar z-10 bg-[#050505]/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ACHIEVEMENTS.map((ach) => {
                            const isUnlocked = unlockedAchievements.includes(ach.id);
                            return (
                                <div 
                                    key={ach.id} 
                                    className={`relative p-5 border rounded transition-all duration-300 group overflow-hidden flex gap-5 items-start ${
                                        isUnlocked 
                                        ? 'bg-gradient-to-br from-neutral-900 to-neutral-950 border-amber-800/40 hover:border-amber-500/60 shadow-[0_4px_20px_rgba(0,0,0,0.5)]' 
                                        : 'bg-black/40 border-neutral-800 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
                                    }`}
                                >
                                    {isUnlocked && <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none rounded-tr"></div>}
                                    
                                    {/* Icon Box */}
                                    <div className={`text-4xl sm:text-5xl shrink-0 flex items-center justify-center w-20 h-20 rounded bg-[#0a0a0a] border border-neutral-800 shadow-inner ${isUnlocked ? 'animate-pulse-slow text-shadow-gold' : ''}`}>
                                        {isUnlocked ? ach.icon : '🔒'}
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 min-w-0 pt-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className={`font-bold font-serif tracking-widest text-lg ${isUnlocked ? 'text-amber-100' : 'text-neutral-600'}`}>
                                                {isUnlocked ? ach.title : (ach.isSecret ? '???' : ach.title)}
                                            </h3>
                                            {isUnlocked && (
                                                <span className="text-[9px] bg-amber-950/50 text-amber-500 px-2 py-0.5 rounded border border-amber-900/50 uppercase tracking-wider font-bold">
                                                    已获得
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-xs leading-relaxed font-yahei ${isUnlocked ? 'text-neutral-400' : 'text-neutral-700'}`}>
                                            {isUnlocked ? ach.desc : (ach.isSecret ? '该勋章的获取条件尚不明确。' : ach.desc)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                {/* Footer Progress */}
                <div className="p-4 border-t border-neutral-800 bg-neutral-900 text-center z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
                    <div className="flex justify-between items-end mb-2 px-4 max-w-2xl mx-auto">
                        <span className="text-xs text-neutral-500 font-mono">COLLECTION PROGRESS</span>
                        <span className="text-sm font-bold font-mono text-amber-500">
                            {Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100)}%
                        </span>
                    </div>
                    <div className="w-full max-w-2xl mx-auto h-1.5 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
                        <div 
                            className="h-full bg-gradient-to-r from-amber-700 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-1000 ease-out" 
                            style={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%` }}
                        ></div>
                    </div>
                    <div className="mt-2 text-[10px] text-neutral-600 font-mono">
                         解锁 {unlockedAchievements.length} / {ACHIEVEMENTS.length} 个结局与成就
                    </div>
                </div>
            </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="absolute bottom-4 text-[10px] text-neutral-700 font-yahei pointer-events-none text-center w-full px-4 leading-tight opacity-60">
        制作组：冰炎工作室<br className="sm:hidden"/> 联系方式：3487005700@qq.com<br className="sm:hidden"/> xuzihao976@gmail.com
      </div>
    </div>
  );
};

export default StartScreen;
