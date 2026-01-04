
import React from 'react';
import { SaveSlotMeta } from '../types';

interface SaveLoadModalProps {
  mode: 'save' | 'load';
  slots: SaveSlotMeta[];
  onSelectSlot: (slotId: number) => void;
  onClose: () => void;
}

const SaveLoadModal: React.FC<SaveLoadModalProps> = ({ mode, slots, onSelectSlot, onClose }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col p-4 sm:p-8 animate-fade-in text-neutral-200">
      <div className="max-w-5xl mx-auto w-full flex flex-col h-full border border-neutral-800 bg-[#0a0a0a] rounded shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-neutral-800 bg-neutral-900">
            <h2 className="text-xl font-bold font-serif tracking-widest text-amber-500">
                {mode === 'save' ? '保存作战记录' : '读取作战记录'}
            </h2>
            <button onClick={onClose} className="text-neutral-500 hover:text-white px-2 text-xl">✕</button>
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {slots.map((slot) => (
                    <button
                        key={slot.id}
                        onClick={() => onSelectSlot(slot.id)}
                        className={`
                            relative h-28 border rounded text-left p-3 transition-all duration-200 group flex flex-col justify-between overflow-hidden
                            ${slot.isEmpty 
                                ? 'border-neutral-800 bg-neutral-900/30 text-neutral-600 hover:bg-neutral-800 hover:border-neutral-600' 
                                : 'border-neutral-700 bg-neutral-900 hover:bg-neutral-800 hover:border-amber-600/50'
                            }
                        `}
                    >
                        {/* Overwrite Ribbon for Non-Empty Save Slots */}
                        {mode === 'save' && !slot.isEmpty && (
                            <div className="absolute top-0 right-0">
                                <div className="bg-neutral-800 text-[9px] text-neutral-500 px-2 py-0.5 rounded-bl group-hover:bg-red-900/80 group-hover:text-red-200 transition-colors">
                                    点击覆盖
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between w-full text-[10px] font-mono opacity-50 mb-1">
                            <span>编号 {String(slot.id + 1).padStart(2, '0')}</span>
                            {!slot.isEmpty && <span>{formatDate(slot.savedAt)}</span>}
                        </div>

                        {slot.isEmpty ? (
                            <div className="flex items-center justify-center h-full text-xs tracking-widest opacity-30">
                                -- 空白档案 --
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-1">
                                    <div className="text-amber-500 font-bold text-sm truncate">
                                        第 {slot.day} 天 <span className="text-neutral-500 text-xs font-normal">| {slot.location}</span>
                                    </div>
                                    <div className="w-full h-[1px] bg-neutral-800"></div>
                                </div>
                                <div className="flex justify-between items-end w-full mt-2">
                                    <span className="text-xs text-neutral-400">幸存: {slot.soldiers}人</span>
                                    {mode === 'save' ? (
                                        <span className="text-[10px] uppercase text-neutral-600 group-hover:text-red-400 transition-colors">
                                            [覆盖保存]
                                        </span>
                                    ) : (
                                        <span className="text-[10px] uppercase text-neutral-600 group-hover:text-green-400 transition-colors">
                                            [读取进度]
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </button>
                ))}
            </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-900 text-center text-[10px] text-neutral-600 font-mono">
            {mode === 'save' ? '选择一个位置保存当前进度 (现有存档将被覆盖)。' : '选择一个档案以继续指挥。'}
        </div>
      </div>
    </div>
  );
};

export default SaveLoadModal;
