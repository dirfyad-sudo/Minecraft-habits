import React, { useState } from 'react';
import { Journal } from '../types';
import { playClickSound, playXPChime } from '../utils/audio';

interface DailyReflectorProps {
  journals: Journal[];
  onAddJournal: (content: string, mood: Journal['mood'], reflection: string) => void;
  triggerNotification: (title: string, desc: string, icon?: string) => void;
}

export default function DailyReflector({
  journals,
  onAddJournal,
  triggerNotification
}: DailyReflectorProps) {
  
  const [content, setContent] = useState('');
  const [reflection, setReflection] = useState('');
  const [mood, setMood] = useState<Journal['mood']>('Villager (Happy)');

  const moodsList: { name: Journal['mood']; icon: string; desc: string; color: string }[] = [
    { name: 'Villager (Happy)', icon: '🧔', desc: 'Senang & Produktif', color: 'border-emerald-600 bg-emerald-950/20 text-emerald-300' },
    { name: 'Enderman (Focused)', icon: '👾', desc: 'Laser Focus', color: 'border-purple-600 bg-purple-950/20 text-purple-300' },
    { name: 'Steve (Excited)', icon: '🧑', desc: 'Penuh Energi', color: 'border-blue-600 bg-blue-950/20 text-blue-300' },
    { name: 'Slime (Lazy)', icon: '🟢', desc: 'Santai / Lambat', color: 'border-lime-600 bg-lime-950/20 text-lime-300' },
    { name: 'Creeper (Stressed)', icon: '💥', desc: 'Stres / Mau Meledak!', color: 'border-rose-600 bg-rose-950/20 text-rose-300' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    playClickSound();
    onAddJournal(content, mood, reflection);
    setContent('');
    setReflection('');
    playXPChime();
    triggerNotification("Refleksi Tercatat!", "Kamu menambang jurnal harian (+25 XP)!", "📖");
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* Reflection Input Form */}
      <div className="mc-panel-inner p-4 text-white">
        <h4 className="mc-font-pixel text-xl text-yellow-400 mb-2 flex items-center gap-2">
          📖 BUKU HARIAN & REFLEKSI (JOURNAL)
        </h4>
        <p className="font-mono text-xs text-stone-400 mb-3">
          Tumpahkan beban pikiranmu ke buku catatan lilin harian untuk menjaga stamina mental.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          
          {/* Mood Selection Matrix Grid */}
          <div className="flex flex-col gap-1.5">
            <label className="mc-font-pixel text-xs text-stone-300">PILIH MOOD KARAKTER-MU HARI INI:</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {moodsList.map((m) => {
                const isSelected = mood === m.name;
                return (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => { playClickSound(); setMood(m.name); }}
                    className={`p-2 border-2 text-center rounded-none cursor-pointer flex flex-col items-center justify-center transition-all ${
                      isSelected 
                        ? `${m.color} border-solid scale-102 ring-2 ring-yellow-400` 
                        : 'border-stone-800 bg-stone-900/40 opacity-60 hover:opacity-100 text-stone-400'
                    }`}
                  >
                    <span className="text-2xl mb-1">{m.icon}</span>
                    <span className="mc-font-pixel text-[11px] uppercase tracking-wider">{m.name.split(' ')[0]}</span>
                    <span className="text-[9px] opacity-75 font-mono">{m.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="mc-font-pixel text-xs text-stone-300">CATATAN AKTIVITAS & EMOSI:</label>
            <textarea 
              rows={3}
              className="w-full bg-stone-900 border-2 border-stone-700 p-2 text-stone-200 outline-none placeholder-stone-500 font-sans text-sm"
              placeholder="Ceritakan harimu hari ini, tantangan yang kamu hadapi..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="mc-font-pixel text-xs text-stone-300">APA YANG KAMU SYUKURI HARI INI? (REFLEKSI):</label>
            <input 
              type="text"
              className="w-full bg-stone-900 border-2 border-stone-700 p-2 text-stone-200 outline-none placeholder-stone-500 font-sans text-sm"
              placeholder="Sebutkan satu hal positif yang terjadi..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="mc-btn w-full py-2 text-base mt-1"
          >
            💾 TUTUP & SIMPAN REFLEKSI (+25 XP)
          </button>
        </form>
      </div>

      {/* Historical logs panel */}
      <div className="flex flex-col gap-2">
        <h5 className="mc-font-pixel text-lg text-stone-300 uppercase">CATATAN BUKU HARIAN SEBELUMNYA:</h5>
        {journals.length === 0 ? (
          <p className="text-xs text-stone-500 font-mono italic p-3 bg-stone-950/20 border border-stone-800">
            Halaman masih kosong. Mulai menulis catatan harian pertamamu!
          </p>
        ) : (
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {journals.map((j) => {
              const matchingMood = moodsList.find(m => m.name === j.mood);
              return (
                <div key={j.id} className="mc-panel-dark text-stone-200 p-3 text-xs">
                  <div className="flex justify-between items-center border-b border-stone-800 pb-1 mb-2">
                    <span className="font-mono text-stone-400">{j.date}</span>
                    <span className="bg-stone-800 px-1.5 py-0.5 rounded font-mono text-stone-300">
                      Mood: {matchingMood ? `${matchingMood.icon} ${matchingMood.name.split(' ')[0]}` : j.mood}
                    </span>
                  </div>
                  <p className="font-sans text-stone-300 leading-relaxed text-[13px]">{j.content}</p>
                  {j.reflection && (
                    <div className="mt-2 text-[11px] font-mono text-emerald-400/90 pl-2 border-l border-emerald-600/50">
                      🍀 Bersyukur: {j.reflection}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
