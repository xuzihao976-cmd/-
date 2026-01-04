
import React, { useState, useRef, useEffect } from 'react';
import { generateAdvisorResponse } from '../services/geminiService';
import { Language } from '../types';

interface Message {
  id: string;
  role: 'user' | 'advisor';
  text: string;
}

interface AdvisorChatProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const AdvisorChat: React.FC<AdvisorChatProps> = ({ isOpen, onClose, lang }) => {
  const initMsg = lang === 'en' 
    ? "Commander. I am your Field Advisor. Ask me about [Victory Conditions], [Stats], or [Tactics]."
    : "指挥官，我是您的战地顾问。关于【胜利条件】、【数值作用】或【新手教程】，请随时询问我。";

  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'advisor', text: initMsg }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset chat when lang changes (optional, but good for UX)
  useEffect(() => {
     setMessages([{ id: 'init', role: 'advisor', text: initMsg }]);
  }, [lang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setIsLoading(true);

    const newMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);

    const apiHistory = updatedMessages.filter(m => m.id !== 'init').map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));

    try {
        const responseText = await generateAdvisorResponse(apiHistory, userText, lang);
        setMessages(prev => [...prev, { id: Date.now().toString() + '_adv', role: 'advisor', text: responseText }]);
    } catch (err) {
        setMessages(prev => [...prev, { id: Date.now().toString() + '_err', role: 'advisor', text: '...' }]);
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-[#1a1a1a] w-full max-w-md h-[500px] border border-neutral-600 rounded-sm shadow-2xl flex flex-col relative font-mono">
            <div className="bg-neutral-800 p-3 border-b border-neutral-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <h3 className="text-neutral-200 font-bold tracking-widest text-sm">{lang === 'en' ? 'FIELD ADVISOR' : '战地顾问 / 教程指南'}</h3>
                </div>
                <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">✕</button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#111]">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] text-xs sm:text-sm p-2 rounded leading-relaxed border ${msg.role === 'user' ? 'bg-neutral-800 text-neutral-300 border-neutral-700' : 'bg-[#0a200a] text-green-100/90 border-green-900/50'}`}>
                            {msg.role === 'advisor' && <div className="text-[9px] text-green-700/70 mb-1 font-bold">{lang === 'en' ? 'HQ:' : '参谋部:'}</div>}
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-3 bg-neutral-800 border-t border-neutral-700">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={lang === 'en' ? "Query..." : "询问..."} className="flex-1 bg-black text-white text-sm px-3 py-2 border border-neutral-600 focus:border-neutral-400 outline-none rounded-sm placeholder-neutral-600" />
                    <button type="submit" disabled={isLoading} className="bg-neutral-700 hover:bg-neutral-600 text-neutral-200 px-4 py-2 text-xs font-bold border border-neutral-600 rounded-sm transition-colors disabled:opacity-50">{lang === 'en' ? "SEND" : "查询"}</button>
                </form>
            </div>
        </div>
    </div>
  );
};

export default AdvisorChat;
