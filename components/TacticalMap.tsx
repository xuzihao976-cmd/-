
import React, { useState, useEffect } from 'react';
import { GameStats, Location, Language } from '../types';
import { UI_TEXT } from '../constants';

interface TacticalMapProps {
  stats: GameStats;
  onAction?: (cmd: string) => void;
  attackLocation?: Location | null; 
  lang: Language;
}

const TacticalMap: React.FC<TacticalMapProps> = ({ stats, onAction, attackLocation, lang }) => {
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null);
  const [flashingLoc, setFlashingLoc] = useState<Location | null>(null);
  const T = UI_TEXT[lang];

  useEffect(() => {
    if (attackLocation) {
        setFlashingLoc(attackLocation);
        const timer = setTimeout(() => setFlashingLoc(null), 2000);
        return () => clearTimeout(timer);
    }
  }, [attackLocation]);

  const handleLocAction = (cmd: string) => {
      if (onAction) {
          onAction(cmd);
          setSelectedLoc(null);
      }
  };

  const getLocDetails = (loc: Location) => {
    if (loc === '一楼入口') return { label: T.loc_1f, desc: T.desc_1f, tac: T.tac_1f };
    if (loc === '二楼阵地') return { label: T.loc_2f, desc: T.desc_2f, tac: T.tac_2f };
    if (loc === '屋顶') return { label: T.loc_roof, desc: T.desc_roof, tac: T.tac_roof };
    if (loc === '地下室') return { label: T.loc_b1, desc: T.desc_b1, tac: T.tac_b1 };
    return { label: loc, desc: "", tac: "" };
  };

  const FloorRender = ({ loc, isBasement = false, isRoof = false }: { loc: Location, isBasement?: boolean, isRoof?: boolean }) => {
      const isCurrent = stats.location === loc || (lang === 'en' && stats.location === getLocDetails(loc).label); // Handle loose string matching if needed
      const isSelected = selectedLoc === loc;
      const isUnderAttack = flashingLoc === loc;
      const level = stats.fortificationLevel[loc] || 0;
      const count = stats.fortificationBuildCounts?.[loc] || 0;
      const isBuilding = count % 2 !== 0 && level < 3;
      const soldierCount = stats.soldierDistribution?.[loc] || 0;
      const hmgSquads = stats.hmgSquads ? stats.hmgSquads.filter(s => s.location === loc) : [];
      const showFlag = isRoof && stats.hasFlagRaised;
      const details = getLocDetails(loc);

      let bgStyle = 'bg-neutral-900/40';
      if (isCurrent) bgStyle = 'bg-amber-900/10';
      if (isSelected) bgStyle = 'bg-neutral-800';
      if (isUnderAttack) bgStyle = 'bg-red-900/40 animate-pulse';

      let borderStyle = 'border-neutral-700';
      if (isCurrent) borderStyle = 'border-amber-600/60';
      if (isSelected) borderStyle = 'border-white/40';
      if (isUnderAttack) borderStyle = 'border-red-500';
      
      const constructionStyle = isBuilding ? { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(234, 179, 8, 0.05) 10px, rgba(234, 179, 8, 0.05) 20px)' } : {};

      return (
          <div 
            onClick={() => setSelectedLoc(loc)}
            className={`relative flex flex-col justify-between p-2 cursor-pointer transition-all duration-300 group border-x-2 border-y ${bgStyle} ${borderStyle} ${isRoof ? 'border-t-0 rounded-t-sm h-24 mt-6' : ''} ${isBasement ? 'border-b-2 rounded-b-sm h-20 bg-[#050505]' : 'h-24'} ${!isRoof && !isBasement ? 'border-y-neutral-800/50' : ''}`}
            style={constructionStyle}
          >
              {isRoof && <div className="absolute -top-4 left-0 right-0 h-4 bg-gradient-to-t from-neutral-800/20 to-transparent pointer-events-none"></div>}
              {isRoof && (
                  <div className="absolute -top-5 right-4 z-20 flex flex-col items-center group/flag">
                       {showFlag ? (
                           <>
                                <div className="relative z-10 w-8 h-5 bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.9)] animate-pulse origin-bottom-left -rotate-12 block transform transition-transform hover:scale-110 cursor-help"></div>
                                <div className="w-1 h-8 bg-gradient-to-b from-neutral-300 to-neutral-600 shadow-lg mt-[-2px]"></div>
                           </>
                       ) : (
                           <div className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity cursor-help">
                                <div className="w-6 h-5 border-2 border-dashed border-neutral-600 rounded-sm mb-0.5 flex items-center justify-center bg-black/20"><span className="text-[10px] text-neutral-500 font-bold">?</span></div>
                                <div className="w-0.5 h-6 bg-neutral-600"></div>
                           </div>
                       )}
                  </div>
              )}

              <div className="flex justify-between items-start z-10">
                  <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                          <span className={`text-xs font-bold font-serif tracking-widest ${isUnderAttack ? 'text-red-400' : (isCurrent ? 'text-amber-500' : 'text-neutral-400')}`}>
                              {details.label} 
                          </span>
                      </div>
                      <div className={`text-[9px] font-mono px-1 rounded border ${level === 3 ? 'text-yellow-400 border-yellow-800 bg-yellow-900/20' : level === 0 ? 'text-red-500 border-red-900 bg-red-900/10' : 'text-neutral-500 border-neutral-700 bg-neutral-800'}`}>Lv.{level}</div>
                  </div>
              </div>

              <div className="flex-1 flex items-center justify-between px-2 py-1">
                 <div className="flex gap-2 items-center">
                    {hmgSquads.map((squad, i) => (
                        <div key={i} className={`relative group/hmg ${squad.status === 'destroyed' ? 'opacity-50 grayscale' : ''}`}>
                            <div className="w-6 h-3 bg-neutral-800 rounded-sm border border-neutral-600 relative z-10"></div>
                            {squad.status !== 'destroyed' && <div className="absolute top-1 -right-2 w-3 h-1 bg-neutral-500"></div>}
                            {squad.status === 'destroyed' && <div className="absolute inset-0 flex items-center justify-center z-20"><span className="text-[8px] text-red-600 font-bold">✕</span></div>}
                            {squad.status === 'active' && <div className="absolute top-0 -right-4 w-4 h-3 bg-orange-500/0 rounded-full animate-ping-fast"></div>}
                        </div>
                    ))}
                 </div>

                 <div className="flex flex-col items-end gap-1">
                    <div className="flex flex-wrap justify-end gap-0.5 max-w-[80px]">
                        {Array.from({ length: Math.min(20, Math.ceil(soldierCount / 10)) }).map((_, i) => (
                            <div key={i} className={`w-1 h-1.5 rounded-[1px] ${isCurrent ? 'bg-amber-700' : 'bg-neutral-600'} ${i % 3 === 0 ? 'opacity-80' : 'opacity-50'}`}></div>
                        ))}
                    </div>
                 </div>
              </div>
              <div className="mt-auto relative w-full h-1.5 flex items-end gap-0.5 opacity-60">
                  {[...Array(3)].map((_, i) => (
                      <div key={i} className={`flex-1 h-full rounded-[1px] transition-all duration-500 ${i < level ? (isUnderAttack ? 'bg-red-600' : (loc === '地下室' ? 'bg-blue-800' : 'bg-stone-500')) : 'bg-neutral-800/30'}`}></div>
                  ))}
              </div>
          </div>
      );
  };

  const details = selectedLoc ? getLocDetails(selectedLoc) : null;

  return (
    <div className="bg-[#080808] border-b border-neutral-800 p-4 select-none relative font-sans">
      <div className="max-w-md mx-auto flex flex-col relative shadow-2xl">
          <div className="absolute top-[190px] left-0 right-0 h-0.5 bg-neutral-600/50 z-0 shadow-[0_0_10px_rgba(0,0,0,0.8)]"></div>
          <div className="absolute top-[190px] left-0 right-0 h-32 bg-gradient-to-b from-neutral-900/80 to-black pointer-events-none z-0"></div>
          <FloorRender loc="屋顶" isRoof />
          <FloorRender loc="二楼阵地" />
          <FloorRender loc="一楼入口" />
          <FloorRender loc="地下室" isBasement />
      </div>
      
      {selectedLoc && details && (
        <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col p-4 animate-fade-in text-neutral-200" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#111] border border-neutral-700 shadow-2xl rounded-lg p-4 flex flex-col h-full max-h-[300px]">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-2 mb-3 bg-[#111]">
                    <h4 className="text-lg font-bold text-amber-500">{details.label}</h4>
                    <button onClick={() => setSelectedLoc(null)} className="text-neutral-500 hover:text-white px-2">✕</button>
                </div>

                <div className="bg-neutral-900/50 p-2 rounded mb-4 border-l-2 border-amber-900">
                     <p className="text-neutral-400 text-xs italic leading-relaxed">{details.desc}</p>
                     <p className="text-amber-700 text-[10px] mt-1 font-bold uppercase">{lang === 'en' ? 'TACTICAL' : '战术价值'}: {details.tac}</p>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                    <button onClick={() => handleLocAction(`前往${selectedLoc}`)} className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded border border-neutral-700 transition-colors flex items-center justify-center gap-2">
                        {T.action_move}
                    </button>
                    {selectedLoc !== '地下室' && (
                        <button onClick={() => handleLocAction(`加固${selectedLoc}`)} className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-amber-500 text-xs font-bold rounded border border-neutral-700 transition-colors flex items-center justify-center gap-2">
                            {T.action_build}
                        </button>
                    )}
                    {selectedLoc === '屋顶' && !stats.hasFlagRaised && (
                            <button onClick={() => handleLocAction(`升旗`)} className="w-full py-3 bg-red-900/20 hover:bg-red-900/30 text-red-500 text-xs font-bold rounded border border-red-800 transition-colors flex items-center justify-center gap-2">
                            {T.action_flag}
                        </button>
                    )}
                    {selectedLoc === '地下室' && stats.wounded > 0 && (
                            <button onClick={() => handleLocAction(`治疗伤员`)} className="w-full py-3 bg-green-900/20 hover:bg-green-900/30 text-green-500 text-xs font-bold rounded border border-green-800 transition-colors flex items-center justify-center gap-2">
                            {T.action_heal}
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default TacticalMap;
