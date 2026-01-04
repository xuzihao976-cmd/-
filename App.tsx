
import React, { useState, useEffect, useRef, useCallback } from 'react';
import StatsPanel from './components/StatsPanel';
import TacticalMap from './components/TacticalMap';
import Typewriter from './components/Typewriter';
import StartScreen from './components/StartScreen';
import SaveLoadModal from './components/SaveLoadModal';
import AdvisorChat from './components/AdvisorChat';
import QuickActions from './components/QuickActions'; 
import DilemmaModal from './components/DilemmaModal';
import TacticalCardDisplay from './components/TacticalCardDisplay'; 
import GameOverModal from './components/GameOverModal'; 
import { GameStats, GameLog, GeminiResponse, SaveData, SaveSlotMeta, Dilemma, Location, EndingType, Language } from './types';
import { INITIAL_STATS, UI_TEXT } from './constants';
import { generateGameTurn } from './services/geminiService';
import { playSound } from './utils/sound';

const SAVE_INDEX_KEY = 'lone_army_save_index';
const SAVE_SLOT_PREFIX = 'lone_army_slot_';
const ACHIEVEMENTS_KEY = 'lone_army_achievements';
const MAX_SLOTS = 50;
const API_TIMEOUT_MS = 90000; 

const App: React.FC = () => {
  // Scene State
  const [view, setView] = useState<'MENU' | 'GAME'>('MENU');
  const [language, setLanguage] = useState<Language>('zh'); // NEW: Language Support
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(false); 
  const [modalMode, setModalMode] = useState<'save' | 'load'>('save');
  const [saveSlots, setSaveSlots] = useState<SaveSlotMeta[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<EndingType[]>([]);
  
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [currentDilemma, setCurrentDilemma] = useState<Dilemma | null>(null);
  const [enemyIntel, setEnemyIntel] = useState<string>("...");
  const [attackLocation, setAttackLocation] = useState<Location | null>(null);
  const [visualEffect, setVisualEffect] = useState<'none' | 'shake' | 'heavy-damage'>('none');
  const [confirmExit, setConfirmExit] = useState(false);

  // Game State
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(true); 
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposing = useRef(false);

  // Short helper for UI text
  const T = UI_TEXT[language];

  useEffect(() => {
    if (visualEffect !== 'none') {
        const timer = setTimeout(() => {
            setVisualEffect('none');
        }, 600); 
        return () => clearTimeout(timer);
    }
  }, [visualEffect]);

  useEffect(() => {
    if (!stats.isGameOver) {
        setShowGameOverModal(false);
    }
  }, [stats.isGameOver]);

  useEffect(() => {
    refreshSaveSlots();
    loadAchievements();
  }, []);

  const loadAchievements = () => {
      try {
          const json = localStorage.getItem(ACHIEVEMENTS_KEY);
          if (json) {
              setUnlockedAchievements(JSON.parse(json));
          }
      } catch (e) {
          console.error("Failed to load achievements", e);
      }
  };

  const unlockAchievement = (endingId: EndingType) => {
      if (endingId === 'ongoing' || endingId === 'defeat_generic') return;
      setUnlockedAchievements(prev => {
          if (!prev.includes(endingId)) {
              const newlist = [...prev, endingId];
              localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(newlist));
              return newlist;
          }
          return prev;
      });
  };

  const refreshSaveSlots = () => {
    try {
        const indexJson = localStorage.getItem(SAVE_INDEX_KEY);
        let meta: SaveSlotMeta[] = [];
        if (indexJson) {
            try {
                meta = JSON.parse(indexJson);
            } catch (err) {
                meta = [];
            }
        }
        const fullSlots: SaveSlotMeta[] = [];
        for (let i = 0; i < MAX_SLOTS; i++) {
            const existing = meta.find(m => m.id === i);
            if (existing) {
                fullSlots.push(existing);
            } else {
                fullSlots.push({ id: i, isEmpty: true, savedAt: 0 });
            }
        }
        setSaveSlots(fullSlots);
    } catch (e) {
        const emptySlots: SaveSlotMeta[] = Array.from({ length: MAX_SLOTS }, (_, i) => ({ id: i, isEmpty: true, savedAt: 0 }));
        setSaveSlots(emptySlots);
    }
  };

  const hasAnySave = () => saveSlots.some(s => !s.isEmpty);

  const handleSaveToSlot = (slotId: number) => {
    try {
        playSound('click');
        const saveData: SaveData = { stats, logs, savedAt: Date.now() };
        localStorage.setItem(SAVE_SLOT_PREFIX + slotId, JSON.stringify(saveData));
        const newMetaItem: SaveSlotMeta = {
            id: slotId, isEmpty: false, savedAt: saveData.savedAt,
            day: stats.day, soldiers: stats.soldiers, location: stats.location
        };
        const newSlots = [...saveSlots];
        newSlots[slotId] = newMetaItem;
        localStorage.setItem(SAVE_INDEX_KEY, JSON.stringify(newSlots.filter(s => !s.isEmpty)));
        setSaveSlots(newSlots);
        setShowSaveLoadModal(false);
        setShowGameMenu(false); 
        alert(language === 'zh' ? "战报已归档！" : "Log Saved!");
    } catch (e) {
        alert("Save failed.");
    }
  };

  const handleLoadFromSlot = (slotId: number) => {
    try {
        playSound('click');
        const json = localStorage.getItem(SAVE_SLOT_PREFIX + slotId);
        if (!json) return;
        const data: SaveData = JSON.parse(json);
        setStats(data.stats); // Simplified migration for brevity
        setLogs(data.logs.map(l => ({ ...l, isTyping: false })));
        setView('GAME');
        setShowSaveLoadModal(false);
        setShowGameMenu(false);
    } catch (e) {
        alert("Load failed.");
    }
  };

  // --- Auto Scroll ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, view, isLoading]);

  const callAiWithTimeout = async (
    currentStats: GameStats, 
    command: string, 
    history: string
  ): Promise<GeminiResponse> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const apiCall = generateGameTurn(currentStats, command, history, language);
    const timeout = new Promise<GeminiResponse>((resolve) => {
        setTimeout(() => {
            resolve({
                narrative: language === 'zh' ? "【系统提示】通讯线路连接超时。" : "[SYSTEM] Connection timeout.",
                updatedStats: {},
                eventTriggered: "none"
            });
        }, API_TIMEOUT_MS);
    });
    return Promise.race([apiCall, timeout]);
  };

  const handleNewGame = async () => {
    playSound('click');
    setStats({...INITIAL_STATS}); 
    setLogs([]);
    setView('GAME');
    setShowGameMenu(false);
    setShowGameOverModal(false);
    setIsLoading(true);
    setCurrentDilemma(null);
    setAttackLocation(null);
    try {
        const startResponse = await callAiWithTimeout(INITIAL_STATS, "START_GAME", "");
        handleAiResponse(startResponse);
    } catch (e) {
        setLogs([{ id: 'error', sender: 'system', text: 'Error.' }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleConfirmExit = () => {
    playSound('click');
    setView('MENU');
    setShowGameMenu(false);
    setConfirmExit(false);
    setStats(prev => ({ ...prev, isGameOver: false }));
    setShowGameOverModal(false); 
    refreshSaveSlots();
  };

  const handleExitRequest = () => {
    playSound('click');
    setConfirmExit(true);
  };

  const handleAiResponse = useCallback((response: GeminiResponse) => {
    setLogs((prev) => [...prev, { id: Date.now().toString(), sender: 'system', text: response.narrative, isTyping: true }]);
    if (response.visualEffect && response.visualEffect !== 'none') setVisualEffect(response.visualEffect);
    if (response.enemyIntel) setEnemyIntel(response.enemyIntel);
    if (response.attackLocation) setAttackLocation(response.attackLocation);
    if (response.dilemma) setTimeout(() => setCurrentDilemma(response.dilemma!), 1500);
    if (response.updatedStats) {
      setStats((prev) => {
        const newStats = { ...prev, ...response.updatedStats };
        // ... (Cleanup Logic kept same)
        if (response.updatedStats.fortificationLevel) newStats.fortificationLevel = { ...prev.fortificationLevel, ...response.updatedStats.fortificationLevel };
        if (response.updatedStats.fortificationBuildCounts) newStats.fortificationBuildCounts = { ...prev.fortificationBuildCounts, ...response.updatedStats.fortificationBuildCounts };
        newStats.turnCount = (prev.turnCount || 0) + 1;
        if (newStats.isGameOver && newStats.gameResult) unlockAchievement(newStats.gameResult);
        return newStats;
      });
    }
  }, []);

  const handleCommand = async (e?: React.FormEvent, directCommand?: string, displayLabel?: string) => {
    if (e) e.preventDefault();
    const userCmd = directCommand || input.trim();
    const logText = displayLabel || userCmd;
    if (isComposing.current || !userCmd || isLoading || stats.isGameOver) return;
    if (!directCommand) setInput('');
    setIsLoading(true);
    playSound('click');
    setLogs((prev) => [...prev.map(l => ({ ...l, isTyping: false })), { id: Date.now().toString(), sender: 'user', text: `> ${logText}` }]);

    try {
        const historySummary = logs.filter(l => l.text && l.id !== 'error').slice(-15).map(l => `[${l.sender}] ${l.text.substring(0, 150)}`).join("\n");
        const response = await callAiWithTimeout(stats, userCmd, historySummary);
        handleAiResponse(response);
    } catch (error) {
        setLogs(prev => [...prev, { id: Date.now().toString(), sender: 'system', text: "Error.", isTyping: false }]);
    } finally {
        setIsLoading(false);
    }
  };

  const finishTyping = useCallback((id: string) => {
    setLogs(prev => prev.map(log => log.id === id ? { ...log, isTyping: false } : log));
  }, []);

  return (
    <div className="w-full h-[100dvh] bg-zinc-950 flex items-center justify-center overflow-hidden">
        <div className={`w-full h-full sm:w-[450px] sm:h-[90dvh] sm:max-h-[850px] bg-[#111] text-[#ddd] flex flex-col relative overflow-hidden sm:rounded-xl sm:border sm:border-neutral-800 sm:shadow-2xl ${visualEffect === 'shake' ? 'effect-shake' : visualEffect === 'heavy-damage' ? 'effect-shake effect-damage' : ''}`}>
          
          {showSaveLoadModal && (
              <SaveLoadModal 
                mode={modalMode} slots={saveSlots} onClose={() => setShowSaveLoadModal(false)}
                lang={language}
                onSelectSlot={(id) => {
                    if (modalMode === 'save') {
                        if (saveSlots[id].isEmpty || window.confirm(`${T.confirm_overwrite} ${id+1}?`)) handleSaveToSlot(id);
                    } else {
                        if (saveSlots[id].isEmpty) return;
                        handleLoadFromSlot(id);
                    }
                }}
              />
          )}
          
          {currentDilemma && (
              <DilemmaModal dilemma={currentDilemma} onChoice={(cmd) => {
                  const opt = currentDilemma.options.find(o => o.actionCmd === cmd);
                  setCurrentDilemma(null);
                  handleCommand(undefined, cmd, opt?.label || "Option");
              }} />
          )}
          
          {showGameOverModal && (
              <GameOverModal stats={stats} onRestart={handleNewGame} onExit={handleConfirmExit} lang={language} />
          )}
          
          <AdvisorChat isOpen={showAdvisor} onClose={() => setShowAdvisor(false)} lang={language} />

          {view === 'MENU' ? (
              <StartScreen 
                onNewGame={handleNewGame} 
                onOpenLoadMenu={() => { refreshSaveSlots(); setModalMode('load'); setShowSaveLoadModal(true); }} 
                hasSaves={hasAnySave()} 
                unlockedAchievements={unlockedAchievements}
                lang={language}
                setLang={setLanguage}
              />
          ) : (
            <>
                {showGameMenu && (
                    <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                        <div className="bg-neutral-900 border border-neutral-700 p-6 rounded-lg shadow-2xl w-full max-w-sm relative">
                            <h3 className="text-xl font-bold text-neutral-200 mb-6 text-center border-b border-neutral-800 pb-2">{T.menu}</h3>
                            {!confirmExit ? (
                                <div className="space-y-3">
                                    <button onClick={() => { playSound('click'); setShowGameMenu(false); }} className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors">{T.returnFront}</button>
                                    <button onClick={() => { refreshSaveSlots(); setModalMode('save'); setShowSaveLoadModal(true); }} className="w-full py-3 bg-neutral-800 hover:bg-amber-900/30 text-amber-500 rounded border border-neutral-700 transition-colors">{T.saveGame}</button>
                                    <button onClick={handleExitRequest} className="w-full py-3 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded border border-red-900/30 transition-colors">{T.retreat}</button>
                                </div>
                            ) : (
                                <div className="space-y-3 text-center">
                                    <p className="text-red-400 text-sm mb-4">{T.confirmRetreat}?</p>
                                    <button onClick={handleConfirmExit} className="w-full py-3 bg-red-800 hover:bg-red-700 text-white rounded font-bold">{T.confirmRetreat}</button>
                                    <button onClick={() => { playSound('click'); setConfirmExit(false); }} className="w-full py-3 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded">{T.cancel}</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <StatsPanel stats={stats} enemyIntel={enemyIntel} lang={language} />

                <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-1 flex justify-center z-10 relative shrink-0">
                    <button onClick={() => { playSound('click'); setShowMap(!showMap); }} className="text-[10px] text-neutral-500 hover:text-neutral-300 uppercase tracking-widest flex items-center gap-1">
                        {showMap ? T.mapHide : T.mapShow}
                    </button>
                </div>

                {showMap && (
                    <div className="shrink-0 border-b border-neutral-800 bg-[#0a0a0a] max-h-[30vh] overflow-y-auto custom-scrollbar touch-pan-y overscroll-contain">
                        <TacticalMap stats={stats} onAction={(cmd) => handleCommand(undefined, cmd)} attackLocation={attackLocation} lang={language} />
                    </div>
                )}

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth font-mono min-h-0 touch-pan-y overscroll-y-contain relative z-0" style={{ WebkitOverflowScrolling: 'touch' }} onClick={() => { const lastLog = logs[logs.length - 1]; if (lastLog?.isTyping) finishTyping(lastLog.id); }}>
                    {logs.map((log) => (
                    <div key={log.id} className={`flex flex-col ${log.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[95%] sm:max-w-[90%] ${log.sender === 'user' ? 'text-neutral-400 font-mono text-sm border-l-2 border-neutral-600 pl-3' : 'text-gray-300 text-sm sm:text-base leading-loose'}`}>
                        {log.sender === 'system' && log.isTyping ? <Typewriter text={log.text} speed={15} onComplete={() => finishTyping(log.id)} /> : <span className="whitespace-pre-wrap">{log.text}</span>}
                        </div>
                    </div>
                    ))}
                    {isLoading && <div className="flex items-center gap-2 text-neutral-500 animate-pulse text-xs font-mono"><span>[{T.waiting}]</span></div>}
                </div>

                <div className="bg-[#1a1a1a] p-2 border-t border-neutral-700 z-20 relative flex flex-col gap-2 shrink-0 pb-safe">
                    {!stats.isGameOver && (
                        <div className="flex justify-between items-center px-1 mb-1">
                            <button onClick={() => { playSound('click'); setShowAdvisor(true); }} className="flex items-center gap-1 px-3 py-1 text-xs text-green-500/90 hover:text-green-400 bg-neutral-900 rounded border border-green-900/50 transition-colors"><span>☍</span> {T.advisor}</button>
                            <button onClick={() => { playSound('click'); setShowGameMenu(true); setConfirmExit(false); }} className="flex items-center gap-1 px-3 py-1 text-xs text-neutral-400 hover:text-white bg-neutral-900 rounded border border-neutral-700 transition-colors"><span>☰</span> {T.menu}</button>
                        </div>
                    )}

                    {!stats.isGameOver ? (
                        <>
                            <QuickActions onAction={(cmd) => handleCommand(undefined, cmd)} disabled={isLoading || !!currentDilemma} stats={stats} lang={language} />
                            <form onSubmit={(e) => handleCommand(e)} className="relative flex gap-2" autoComplete="off">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono select-none">{'>'}</div>
                                <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onCompositionStart={() => isComposing.current = true} onCompositionEnd={() => isComposing.current = false} placeholder={currentDilemma ? T.choice : (isLoading ? T.waiting : T.placeholder)} disabled={!!currentDilemma} className="w-full bg-neutral-900 text-white pl-8 pr-4 py-2.5 rounded-md border border-neutral-700 focus:border-neutral-500 focus:outline-none font-mono placeholder-neutral-600 text-sm appearance-none" />
                                <button type="submit" disabled={isLoading || !!currentDilemma} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2 rounded-md border border-neutral-700 font-medium transition-colors disabled:opacity-50 text-xs whitespace-nowrap">{isLoading ? '...' : T.sendCommand}</button>
                            </form>
                        </>
                    ) : (
                        <div className="p-2 animate-fade-in">
                            <button onClick={() => { playSound('click'); setShowGameOverModal(true); }} className="w-full py-4 bg-red-900/30 border border-red-600/50 text-red-400 hover:bg-red-900/50 hover:text-white font-bold tracking-widest rounded-md shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all uppercase flex items-center justify-center gap-2"><span>📋</span> {T.gameOver}</button>
                        </div>
                    )}
                </div>
            </>
          )}
        </div>
    </div>
  );
};

export default App;
