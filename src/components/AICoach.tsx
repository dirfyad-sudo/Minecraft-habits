import React, { useState, useRef, useEffect } from 'react';
import { playClickSound, playXPChime } from '../utils/audio';

interface AICoachProps {
  userXP: number;
  userLevel: number;
  activeStreak: number;
  activeTopic?: string;
}

export default function AICoach({
  userXP,
  userLevel,
  activeStreak,
  activeTopic = "Produktivitas Umum"
}: AICoachProps) {
  
  const [messages, setMessages] = useState<{ sender: 'user' | 'coach'; text: string }[]>([
    { sender: 'coach', text: 'Halo Petualang! Aku Steve, AI Productivity Coach-mu. Bagaimana keadaan di dunia produktivitasmu hari ini? Butuh saran redstone schedule atau tips bertahan dari Phantoms?' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;

    playClickSound();
    const userMsg = inputVal;
    setInputVal('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          userXP,
          userLevel,
          recentHabitStats: `Streak aktif adalah ${activeStreak} hari`,
          activeTopic
        })
      });

      if (!response.ok) throw new Error("AI Coach gagal membalas");
      const data = await response.json();

      setMessages(prev => [...prev, { sender: 'coach', text: data.reply || "Gagal memproses pesan." }]);
      playXPChime();
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'coach', text: "Maaf petualang, penyihir AI-mu sedang offline karena kekurangan redstone power. Coba sesaat lagi!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mc-panel-inner p-4 text-white flex flex-col min-h-[400px] justify-between">
      
      {/* Header */}
      <div className="border-b border-stone-800 pb-2 mb-3">
        <h4 className="mc-font-pixel text-xl text-purple-400 flex items-center gap-2">
          🔮 STEVE AI COACH & ASISTEN BELAJAR
        </h4>
        <p className="font-mono text-[10px] text-stone-400">
          Uraikan hambatan belajarmu dalam analogi Minecraft yang mudah diingat!
        </p>
      </div>

      {/* Messages Pane */}
      <div className="flex-1 overflow-y-auto max-h-[300px] mb-3 flex flex-col gap-3 pr-1">
        {messages.map((m, i) => {
          const isCoach = m.sender === 'coach';
          return (
            <div 
              key={i} 
              className={`p-3 max-w-[85%] rounded-none flex gap-2.5 ${
                isCoach 
                  ? 'mr-auto bg-[#251e18] border-2 border-[#413429] text-stone-200 shadow-[inset_2px_2px_0_#4e3d2f]' 
                  : 'ml-auto bg-[#1e5210] border-2 border-[#3c8527] text-stone-100 shadow-[inset_-2px_-2px_0_#153d0b]'
              }`}
            >
              {/* Avatar Indicator */}
              <div className="text-xl select-none">{isCoach ? "🧙" : "🧑"}</div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[9px] uppercase font-bold text-stone-400 leading-none">
                  {isCoach ? "STEVE AI COACH" : "KAMU"}
                </span>
                <p className="font-sans text-xs leading-relaxed whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="p-3 bg-[#251e18] border border-stone-800 mr-auto text-xs font-mono text-stone-400 animate-pulse">
             Steve sedang menulis resep ramuan coach baru...
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Tray */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input 
          type="text"
          className="flex-1 bg-stone-900 border-2 border-stone-700 p-2 text-stone-200 text-xs font-sans outline-none placeholder-stone-500 h-9"
          placeholder="Tanya: 'Bagaimana cara membagi prioritasku?'..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={isLoading}
          required
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="mc-btn px-4 text-xs h-9"
        >
          KIRIM
        </button>
      </form>

    </div>
  );
}
