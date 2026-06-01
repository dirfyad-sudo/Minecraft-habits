import React, { useState } from 'react';
import { Habit } from '../types';
import { playClickSound, playXPChime, playHurtSound } from '../utils/audio';

interface HabitTrackerProps {
  habits: Habit[];
  lifeAreas: string[];
  onAddHabit: (title: string, category: string) => void;
  onToggleHabitDate: (id: string, date: string) => void;
  onDeleteHabit: (id: string) => void;
  triggerNotification: (title: string, desc: string, icon?: string) => void;
}

export default function HabitTracker({
  habits,
  lifeAreas,
  onAddHabit,
  onToggleHabitDate,
  onDeleteHabit,
  triggerNotification
}: HabitTrackerProps) {
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(lifeAreas[0] || 'Kesehatan');
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{title: string, description: string, category: string}[]>([]);

  // Generate date strings for the past 5 days in YYYY-MM-DD
  const getPastDates = (): { label: string; dateStr: string }[] => {
    const dates = [];
    const dayLabels = ['H-4', 'H-3', 'Kemarin', 'Hari Ini']; // Indonesian localized labels
    for (let i = 3; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      let label = dayLabels[3 - i];
      if (i === 0) label = "Hari Ini";
      else if (i === 1) label = "Kemarin";
      else {
        // E.g. "Sen", "Sel" etc
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        label = days[d.getDay()];
      }

      dates.push({ label, dateStr });
    }
    return dates;
  };

  const datesList = getPastDates();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    playClickSound();
    onAddHabit(title, category);
    setTitle('');
  };

  // Trigger server-side AI Habit recommendations
  const handleAIHabits = async () => {
    playClickSound();
    setIsAILoading(true);
    try {
      const response = await fetch('/api/ai/habits-rec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lifeAreas })
      });
      if (!response.ok) throw new Error("Gagal mengambil habit suggestions");
      const data = await response.json();
      setAiSuggestions(data);
      playXPChime();
      triggerNotification("Rekomendasi Diraih!", "Minecraft AI merekomendasikan target kebiasaan baru!", "🔮");
    } catch (err) {
      console.error(err);
      alert("Gagal memanggil Minecraft AI Habit Recommendations.");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleAddSuggested = (suggestedTitle: string, suggestedCat: string) => {
    playClickSound();
    onAddHabit(suggestedTitle, suggestedCat);
    triggerNotification("Misi Terdaftar!", `Habit "${suggestedTitle}" aktif!`, "⭐");
    // Clear suggestion when added
    setAiSuggestions(prev => prev.filter(item => item.title !== suggestedTitle));
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* 1. Quick create form */}
      <div className="mc-panel-inner p-4 text-white">
        <h4 className="mc-font-pixel text-xl text-yellow-400 mb-3 flex items-center gap-2">
          ⚔️ PENAMBANGAN KEBIASAAN (HABITS)
        </h4>
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-2">
          <input 
            type="text"
            className="flex-1 bg-stone-900 border-2 border-stone-700 p-2 text-stone-200 outline-none placeholder-stone-500 font-sans"
            placeholder="Contoh: Belajar Coding, Pushup di rumah..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select 
            className="bg-stone-900 border-2 border-stone-700 p-2 text-stone-200 text-xs mc-font-pixel h-10"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {lifeAreas.map((area) => (
              <option key={area} value={area}>📦 {area}</option>
            ))}
          </select>
          <button 
            type="submit" 
            className="mc-btn px-4 py-2 text-sm shrink-0 whitespace-nowrap"
          >
            + DAFTAR KEBIASAAN (+15 XP)
          </button>
        </form>

        {/* AI Generator Trigger */}
        <div className="mt-3 border-t border-stone-800/60 pt-3 flex items-center justify-between">
          <p className="text-xs text-stone-400 font-mono">Capek bingung buat kebiasaan? Mintalah rekomendasi Minecraft AI!</p>
          <button
            onClick={handleAIHabits}
            disabled={isAILoading}
            className="p-1 px-3 bg-purple-900 text-purple-200 text-xs border border-purple-700 hover:bg-purple-800 active:scale-95 cursor-pointer font-sans rounded"
          >
            {isAILoading ? "Menganalisis..." : "🔮 Rekomendasi Habit AI"}
          </button>
        </div>
      </div>

      {/* AI Suggestions Box */}
      {aiSuggestions.length > 0 && (
        <div className="bg-purple-950/40 p-3 border-2 border-purple-900 text-stone-300">
          <h5 className="mc-font-pixel text-purple-400 font-bold mb-2">🔮 TINJAUAN REKOMENDASI HABIT AI:</h5>
          <div className="flex flex-col gap-2">
            {aiSuggestions.map((s, i) => (
              <div key={i} className="flex justify-between items-start gap-2 bg-stone-950/40 p-2 border border-purple-800/40">
                <div>
                  <h6 className="text-[13px] font-bold text-yellow-300 font-sans">{s.title}</h6>
                  <p className="text-[11px] font-mono text-stone-400 mt-0.5">{s.description}</p>
                </div>
                <button
                  onClick={() => handleAddSuggested(s.title, s.category)}
                  className="mc-btn text-[11px] px-2 py-1 bg-stone-800 shrink-0"
                >
                  AKTIFKAN
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Habits Timeline List */}
      <div className="flex flex-col gap-3">
        {habits.length === 0 ? (
          <div className="p-8 text-center bg-stone-900/30 border-4 border-dashed border-stone-700">
            <span className="text-3xl block mb-2 opacity-50">🛡️</span>
            <p className="mc-font-pixel text-stone-400 text-xl uppercase">Belum ada Kebiasaan Tambahan.</p>
            <p className="text-xs text-stone-500 font-mono mt-1">Gunakan formulir atau AI di atas untuk mendaftar!</p>
          </div>
        ) : (
          habits.map((habit) => {
            return (
              <div 
                key={habit.id}
                className="mc-panel-dark text-stone-200 p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-300 font-sans font-semibold">
                      {habit.title}
                    </span>
                    <span className="text-[10px] font-mono bg-stone-800 text-yellow-300 border border-stone-600 px-1">
                      {habit.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-stone-400 font-mono">Streak: {habit.streak} hari</span>
                    <span className="text-xs text-stone-500 font-mono">•</span>
                    <span className="text-xs text-stone-400 font-mono">Jumlah Latihan: {habit.completedDates.length} kali</span>
                  </div>
                </div>

                {/* 5-day horizontal grid timeline */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <div className="flex items-center gap-1 bg-stone-950 p-1.5 border border-stone-800">
                    {datesList.map((slot) => {
                      const isCompleted = habit.completedDates.includes(slot.dateStr);
                      return (
                        <div 
                          key={slot.dateStr}
                          className="flex flex-col items-center gap-1 px-1.5"
                        >
                          <span className="text-[9px] font-mono uppercase text-stone-500 leading-none">
                            {slot.label}
                          </span>
                          <button
                            onClick={() => {
                              playXPChime();
                              onToggleHabitDate(habit.id, slot.dateStr);
                            }}
                            className={`w-6 h-6 border-2 flex items-center justify-center cursor-pointer transition-colors ${
                              isCompleted 
                                ? 'bg-green-700 border-green-500 text-green-200 shadow-[inset_-2px_-2px_0_#1e5210]' 
                                : 'bg-stone-900 border-stone-700 hover:border-stone-500'
                            }`}
                          >
                            {isCompleted ? "✔" : ""}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      playHurtSound();
                      onDeleteHabit(habit.id);
                    }}
                    className="p-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 text-xs shrink-0 cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
