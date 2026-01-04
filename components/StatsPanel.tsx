
import React from 'react';
import { GameStats, Language } from '../types';
import { UI_TEXT } from '../constants';

interface StatsPanelProps {
  stats: GameStats;
  enemyIntel?: string;
  lang: Language;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, enemyIntel, lang }) => {
  const T = UI_TEXT[lang];
  const currentDate = 26 + stats.day;
  
  const activeHmgCount = stats.hmgSquads ? stats.hmgSquads.reduce((acc, s) => acc + (s.status === 'active' ? s.count : 0), 0) : 0;
  const totalLiving = stats.soldiers + stats.wounded + activeHmgCount;
  
  const siegePercent = stats.siegeMeter || 0;
  let siegeColor = 'bg-neutral-600';
  if (siegePercent > 80) siegeColor = 'bg-red-600 animate-pulse';
  else if (siegePercent > 50) siegeColor = 'bg-orange-500';
  else if (siegePercent > 20) siegeColor = 'bg-yellow-600';

  const getLocDisplay = (loc: string) => {
      if (loc.includes('一楼') || loc === '1F Gate') return T.loc_1f;
      if (loc.includes('二楼') || loc === '2F Position') return T.loc_2f;
      if (loc.includes('屋顶') || loc === 'Rooftop') return T.loc_roof;
      if (loc.includes('地下') || loc === 'Basement') return T.loc_b1;
      return loc;
  };

  return (
    <div className="bg-black border-b border-neutral-800 shadow-2xl sticky top-0 z-30">
      <div className="max-w-md mx-auto flex flex-col">
        
        <div className="flex border-b border-neutral-800 h-7">
            <div className="w-[60%] bg-red-900/10 flex items-center px-2 gap-2 overflow-hidden relative border-r border-neutral-800">
                <span className="text-[9px] font-bold text-red-700 whitespace-nowrap uppercase tracking-widest animate-pulse shrink-0">{T.intel}</span>
                <div className="mask-gradient-right overflow-hidden w-full">
                    <span className="text-[10px] text-red-400/90 font-mono whitespace-nowrap animate-marquee inline-block">{enemyIntel || "..."}</span>
                </div>
            </div>
            
            <div className="flex-1 bg-black flex items-center px-2 gap-2 justify-between min-w-0">
                <span className="text-[9px] font-bold text-neutral-500 whitespace-nowrap shrink-0">{T.siege}</span>
                <div className="flex-1 h-2 bg-neutral-900 rounded-full overflow-hidden mx-1 border border-neutral-800">
                    <div className={`h-full transition-all duration-700 ease-out ${siegeColor}`} style={{ width: `${siegePercent}%` }}></div>
                </div>
                <span className="text-[9px] font-mono text-neutral-600 w-6 text-right">{siegePercent}%</span>
            </div>
        </div>

        <div className="flex items-stretch bg-[#0a0a0a] border-b border-neutral-800 h-10">
            <div className="flex flex-col justify-center px-2 border-r border-neutral-800 min-w-[70px] bg-[#111]">
                <div className="flex items-baseline gap-1 leading-none mb-1">
                    <span className="text-xs text-neutral-200 font-bold font-serif">{lang === 'en' ? 'Oct' : ''}{currentDate}{lang === 'zh' ? '日' : ''}</span>
                    <span className="text-[8px] text-red-800 font-bold">{T.day}{stats.day}</span>
                </div>
                <span className="text-sm text-amber-500 font-mono font-bold tracking-widest leading-none">{stats.currentTime}</span>
            </div>

            <div className="flex-1 flex items-center justify-between px-3 border-r border-neutral-800 min-w-0">
                 <div className="flex flex-col justify-center min-w-0">
                    <div className="text-[8px] text-neutral-600 tracking-wider uppercase truncate">{T.pos}</div>
                    <div className="text-xs sm:text-sm text-amber-500/90 font-bold font-serif tracking-widest truncate">{getLocDisplay(stats.location)}</div>
                 </div>
                 
                 <div className="flex flex-col items-end justify-center pl-2 shrink-0">
                    <span className="text-[8px] text-neutral-500 mb-0.5 scale-90 origin-right">{T.flagStatus}</span>
                    {stats.hasFlagRaised ? (
                        <div className="flex items-center gap-1 text-red-500 font-bold text-[10px] border border-red-900/50 px-2 py-0.5 bg-red-900/20 shadow-[0_0_8px_rgba(220,38,38,0.5)] rounded-sm">
                            <span className="animate-pulse flex items-center justify-center"><div className="w-2.5 h-2 bg-red-600 shadow-sm"></div></span> {T.flagRaised}
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-neutral-200 font-bold text-[10px] border border-neutral-600 px-2 py-0.5 bg-neutral-800/80 shadow-[0_0_5px_rgba(255,255,255,0.1)] rounded-sm">
                             <span className="text-neutral-400">⚑</span> {T.flagNone}
                        </div>
                    )}
                 </div>
            </div>

            <div className="flex items-center px-1 gap-1 bg-[#050505]">
                <div className="flex flex-col items-center w-10">
                    <span className="text-[8px] text-neutral-500">{T.troops}</span>
                    <span className={`text-xs font-bold font-mono ${totalLiving < 100 ? 'text-red-500' : 'text-neutral-300'}`}>{totalLiving}</span>
                </div>
                <div className="w-px h-6 bg-neutral-800"></div>
                <div className="flex flex-col items-center w-10">
                    <span className="text-[8px] text-neutral-500">{T.wounded}</span>
                    <span className={`text-xs font-bold font-mono ${stats.wounded > 0 ? 'text-orange-500' : 'text-neutral-500'}`}>{stats.wounded}</span>
                </div>
                <div className="w-px h-6 bg-neutral-800"></div>
                <div className="flex flex-col items-center w-10">
                    <span className="text-[8px] text-neutral-500">{T.morale}</span>
                    <span className={`text-xs font-bold font-mono ${stats.morale < 30 ? 'text-red-500 animate-pulse' : 'text-neutral-300'}`}>{stats.morale}</span>
                </div>
            </div>
        </div>
        
        {stats.hmgSquads && stats.hmgSquads.length > 0 && (
            <div className="flex bg-[#0f0f0f] border-b border-neutral-800 py-1 px-1 gap-1 h-8 items-center">
                 <div className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest shrink-0 w-8 text-center leading-tight">{T.hmg}</div>
                 <div className="flex-1 flex gap-1">
                    {stats.hmgSquads.map((squad, idx) => (
                        <div key={idx} className={`flex-1 flex items-center justify-between px-2 rounded border text-[10px] ${squad.status === 'active' ? 'border-orange-900/30 bg-orange-900/10' : 'border-red-900/50 bg-red-900/20 grayscale'}`}>
                            <div className="flex flex-col leading-none">
                                <span className={`${squad.status === 'active' ? 'text-orange-500' : 'text-red-600 line-through'} font-bold font-yahei`}>{lang === 'en' ? `HMG Sqd ${idx+1}` : squad.name}</span>
                            </div>
                            <span className={`font-mono font-bold text-xs ${squad.status === 'active' ? 'text-neutral-300' : 'text-red-600'}`}>
                                {squad.status === 'active' ? `${squad.count}` : '☠'}
                            </span>
                        </div>
                    ))}
                 </div>
            </div>
        )}

        <div className="flex w-full bg-neutral-900 border-b border-neutral-800 py-1 px-1 gap-1 h-9 items-stretch">
             {[
                { l: T.ammo79, v: stats.ammo > 9999 ? '9999+' : stats.ammo, c: stats.ammo < 5000 ? 'text-red-500 animate-pulse' : 'text-yellow-700' },
                { l: T.ammoMg, v: stats.machineGunAmmo > 5000 ? '5000+' : stats.machineGunAmmo, c: 'text-orange-700' },
                { l: T.grenades, v: stats.grenades, c: 'text-neutral-300' },
                { l: T.food, v: stats.sandbags, c: 'text-stone-500' },
                { l: T.meds, v: stats.medkits, c: stats.medkits < 10 ? 'text-red-500 animate-pulse' : 'text-green-700' }
             ].map((item, i) => (
                <div key={i} className="flex-1 bg-black px-1 sm:px-2 rounded border border-neutral-800 flex flex-col justify-center items-center gap-0.5 min-w-0">
                    <span className="text-[9px] text-neutral-500 font-bold scale-90 whitespace-nowrap font-yahei">{item.l}</span>
                    <span className={`text-[10px] sm:text-xs font-bold font-yahei ${item.c}`}>{item.v}</span>
                </div>
             ))}
        </div>
        
        <div className="relative h-1 bg-neutral-900 border-b border-neutral-800 w-full">
            <div className={`absolute left-0 top-0 h-full transition-all duration-500 ${stats.health < 30 ? 'bg-red-900' : 'bg-neutral-600'}`} style={{ width: `${stats.health}%` }}></div>
        </div>

      </div>
    </div>
  );
};

export default StatsPanel;
