import React, { useState } from 'react';
import { StudyRoadmap, Flashcard } from '../types';
import { playClickSound, playXPChime, playHurtSound } from '../utils/audio';

interface StudyPlannerProps {
  roadmaps: StudyRoadmap[];
  flashcards: Flashcard[];
  onAddRoadmap: (title: string, target: string, steps: string[]) => void;
  onAddFlashcard: (deck: string, front: string, back: string) => void;
  onDeleteFlashcard: (id: string) => void;
  onDeleteRoadmap: (id: string) => void;
  triggerNotification: (title: string, desc: string, icon?: string) => void;
}

export default function StudyPlanner({
  roadmaps,
  flashcards,
  onAddRoadmap,
  onAddFlashcard,
  onDeleteFlashcard,
  onDeleteRoadmap,
  triggerNotification
}: StudyPlannerProps) {
  
  // Tab selection: "schedule" | "roadmap" | "flashcard"
  const [activeTab, setActiveTab] = useState<'schedule' | 'roadmap' | 'flashcard'>('schedule');

  // 1. Schedule state
  const [scheduleItems, setScheduleItems] = useState<{ id: string; time: string; activity: string }[]>([
    { id: '1', time: '08:00', activity: 'Mining Pengetahuan (Membaca)' },
    { id: '2', time: '13:00', activity: 'Fokus Coding Project Utama (Gemini Tool)' },
    { id: '3', time: '19:00', activity: 'Olahraga Kardio / Gym' }
  ]);
  const [newTime, setNewTime] = useState('');
  const [newActivity, setNewActivity] = useState('');

  // 2. Roadmap Generator state
  const [roadmapTopic, setRoadmapTopic] = useState('');
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  // 3. Flashcards state
  const [flashcardDeck, setFlashcardDeck] = useState('Dunia Umum');
  const [flashcardFront, setFlashcardFront] = useState('');
  const [flashcardBack, setFlashcardBack] = useState('');
  const [flippedCardIds, setFlippedCardIds] = useState<{ [id: string]: boolean }>({});

  // 1. Handle adding schedule hour item
  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime || !newActivity.trim()) return;
    playClickSound();
    
    const newItem = {
      id: Math.random().toString(),
      time: newTime,
      activity: newActivity
    };

    setScheduleItems(prev => [...prev, newItem].sort((a,b) => a.time.localeCompare(b.time)));
    setNewTime('');
    setNewActivity('');
    triggerNotification("Agenda Terpaku!", "Jadwal harian baru ditambahkan ke papan agenda!", "📌");
  };

  const removeSchedule = (id: string) => {
    playHurtSound();
    setScheduleItems(prev => prev.filter(item => item.id !== id));
  };

  // 2. Handle Roadmap generation using Express' server AI API
  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmapTopic.trim()) return;
    playClickSound();
    setIsGeneratingRoadmap(true);

    try {
      const response = await fetch('/api/ai/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: roadmapTopic })
      });

      if (!response.ok) throw new Error("Gagal generate roadmap");
      const data = await response.json();

      if (data.steps && data.steps.length > 0) {
        onAddRoadmap(data.title || `Peta Jalan: ${roadmapTopic}`, roadmapTopic, data.steps);
        setRoadmapTopic('');
        playXPChime();
        triggerNotification(
          "Peta Jalan Terbentang!",
          `Tantangan kustom baru dibuat untuk ${roadmapTopic}!`,
          "🗺️"
        );
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memanggil Minecraft AI Roadmap Generator.");
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // 3. Spaced repetition flashcard add
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashcardFront.trim() || !flashcardBack.trim()) return;
    playClickSound();
    onAddFlashcard(flashcardDeck, flashcardFront, flashcardBack);
    setFlashcardFront('');
    setFlashcardBack('');
    playXPChime();
    triggerNotification(
      "Kartu Memori Ditempa!",
      "Berhasil membuat flashcard belajar baru!",
      "🎴"
    );
  };

  // Toggle Flip Card
  const toggleCardFlip = (id: string) => {
    playClickSound();
    setFlippedCardIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* Tab Navigation header */}
      <div className="flex bg-stone-900 border border-stone-800 p-1">
        <button
          onClick={() => { playClickSound(); setActiveTab('schedule'); }}
          className={`flex-1 py-1.5 mc-font-pixel uppercase text-base transition-all cursor-pointer ${
            activeTab === 'schedule' ? 'bg-[#3c8527] text-white border-b-2 border-green-700' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          📅 AGENDA HARIAN
        </button>
        <button
          onClick={() => { playClickSound(); setActiveTab('roadmap'); }}
          className={`flex-1 py-1.5 mc-font-pixel uppercase text-base transition-all cursor-pointer ${
            activeTab === 'roadmap' ? 'bg-[#3c8527] text-white border-b-2 border-green-700' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          🔮 AI ROADMAP GENERATOR
        </button>
        <button
          onClick={() => { playClickSound(); setActiveTab('flashcard'); }}
          className={`flex-1 py-1.5 mc-font-pixel uppercase text-base transition-all cursor-pointer ${
            activeTab === 'flashcard' ? 'bg-[#3c8527] text-white border-b-2 border-green-700' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          🎴 FLASHCARDS (BELAJAR)
        </button>
      </div>

      {/* ==================== 1. SCHEDULE PLANNER ==================== */}
      {activeTab === 'schedule' && (
        <div className="flex flex-col gap-4">
          
          <div className="mc-panel-inner p-4 text-white">
            <h4 className="mc-font-pixel text-lg text-yellow-400 mb-2">📋 CATAT TIMELINE AGENDA HARIANMU</h4>
            <form onSubmit={handleAddSchedule} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
              <input 
                type="time"
                className="bg-stone-900 border-2 border-stone-700 p-2 text-stone-200 font-sans outline-none shrink-0 h-10 w-28 text-center"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
              />
              <input 
                type="text"
                className="bg-stone-900 border-2 border-stone-700 p-2 text-stone-200 font-sans outline-none flex-1 h-10"
                placeholder="Rencana kegiatan (Contoh: Menghadiri kelas, istirahat kopi cangkir)..."
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                required
              />
              <button 
                type="submit"
                className="mc-btn px-4 py-2 text-xs shrink-0 h-10 w-full sm:w-auto"
              >
                TAMPILKAN AGENDA
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-2">
            <h5 className="mc-font-pixel text-[15px] text-stone-300 uppercase">DAFTAR JADWAL HARI INI:</h5>
            {scheduleItems.length === 0 ? (
              <p className="text-stone-500 font-mono text-xs italic">Agenda kosong hari ini. Nikmati petualangan bebasmu!</p>
            ) : (
              <div className="flex flex-col gap-2">
                {scheduleItems.map((item) => (
                  <div key={item.id} className="mc-panel-dark text-stone-200 p-3 flex justify-between items-center gap-2">
                    <div className="flex items-center gap-3">
                      <span className="mc-font-pixel text-[#ffaa00] text-lg bg-stone-950 p-1 px-2 border border-stone-800">
                        ⏱️ {item.time}
                      </span>
                      <span className="font-sans text-stone-200 text-sm">{item.activity}</span>
                    </div>
                    <button
                      onClick={() => removeSchedule(item.id)}
                      className="text-stone-500 hover:text-red-400 font-mono text-xs p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ==================== 2. ROADMAP GENERATOR ==================== */}
      {activeTab === 'roadmap' && (
        <div className="flex flex-col gap-4">
          
          <div className="mc-panel-inner p-4 text-white">
            <h4 className="mc-font-pixel text-lg text-purple-400 mb-1">🔮 JALAN MENITI ENDER (ROADMAPS)</h4>
            <p className="text-xs text-stone-400 font-mono mb-3">
              Mulai menambang pemahaman topik sulit dengan menjadikannya linear peta tantangan petualangan custom AI.
            </p>

            <form onSubmit={handleGenerateRoadmap} className="flex gap-2">
              <input 
                type="text"
                className="bg-stone-900 border-2 border-stone-700 p-2 text-stone-200 font-sans outline-none flex-1 h-10 placeholder-stone-500"
                placeholder="Topik apa yang ingin kamu kuasai? (Contoh: React.JS, JavaScript, Mikrobiologi)..."
                value={roadmapTopic}
                onChange={(e) => setRoadmapTopic(e.target.value)}
                required
              />
              <button 
                type="submit"
                disabled={isGeneratingRoadmap}
                className="mc-btn px-4 py-2 text-xs shrink-0 h-10"
              >
                {isGeneratingRoadmap ? "CRAFTING AI..." : "🔮 TEMPA PETA"}
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-5">
            <h5 className="mc-font-pixel text-[15px] text-stone-300 uppercase">DAFTAR PILIHAN PETA BELAJAR AKTIF:</h5>
            {roadmaps.length === 0 ? (
              <p className="text-stone-500 font-mono text-xs italic">Belum ada peta jalan AI aktif. Mulailah mengetik ide di atas!</p>
            ) : (
              roadmaps.map((map) => (
                <div key={map.id} className="mc-panel-dark text-stone-200 p-4 border-2 border-stone-700">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-stone-800">
                    <h6 className="mc-font-pixel text-yellow-500 text-lg uppercase tracking-wide">
                      🗺️ {map.title}
                    </h6>
                    <button
                      onClick={() => { playHurtSound(); onDeleteRoadmap(map.id); }}
                      className="text-xs bg-stone-800 border-2 border-stone-700 px-2 text-red-300 hover:text-red-100 cursor-pointer"
                    >
                      Bongkar
                    </button>
                  </div>

                  {/* Flow Steps visuals */}
                  <div className="flex flex-col gap-3 relative before:absolute before:inset-y-3 before:left-4 before:w-1 before:bg-dashed before:border-stone-800">
                    {map.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-center z-10">
                        <div className="w-8 h-8 rounded-none bg-stone-900 border-2 border-[#3c8527] flex items-center justify-center text-xs font-bold font-mono text-green-300">
                          {idx + 1}
                        </div>
                        <span className="font-mono text-stone-300 text-xs sm:text-xs">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ==================== 3. FLASHCARDS SYSTEM ==================== */}
      {activeTab === 'flashcard' && (
        <div className="flex flex-col gap-4">
          
          <div className="mc-panel-inner p-4 text-white">
            <h4 className="mc-font-pixel text-lg text-yellow-400 mb-2">🎴 CREATIVE CRAFT FLASHCARDS</h4>
            <form onSubmit={handleAddCard} className="flex flex-col gap-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input 
                  type="text"
                  className="bg-stone-900 border-2 border-stone-700 p-2 text-stone-200 font-sans outline-none text-xs"
                  placeholder="Kategori Dek (Default: Dunia Umum)..."
                  value={flashcardDeck}
                  onChange={(e) => setFlashcardDeck(e.target.value)}
                />
                <input 
                  type="text"
                  className="bg-stone-900 border-2 border-stone-700 p-2 text-stone-200 font-sans outline-none text-xs"
                  placeholder="Pertanyaan Depan..."
                  value={flashcardFront}
                  onChange={(e) => setFlashcardFront(e.target.value)}
                  required
                />
                <input 
                  type="text"
                  className="bg-stone-900 border-2 border-stone-700 p-2 text-stone-200 font-sans outline-none text-xs"
                  placeholder="Jawaban Belakang..."
                  value={flashcardBack}
                  onChange={(e) => setFlashcardBack(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit"
                className="mc-btn w-full py-1 text-sm mt-1"
              >
                + TEMPA KARTU MEMORI AKTIF RECALL
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-3">
            <h5 className="mc-font-pixel text-[15px] text-stone-300 uppercase">AKSES DEK KARTU MEMORI:</h5>
            {flashcards.length === 0 ? (
              <p className="text-stone-500 font-mono text-xs italic">Dek kosong. Buatlah kartu memori pertamamu di atas!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {flashcards.map((card) => {
                  const isFlipped = !!flippedCardIds[card.id];
                  return (
                    <div 
                      key={card.id}
                      className="mc-panel-dark text-stone-200 p-3 flex flex-col justify-between gap-3 relative min-h-[140px]"
                    >
                      {/* Close */}
                      <button
                        onClick={() => { playHurtSound(); onDeleteFlashcard(card.id); }}
                        className="absolute top-2 right-2 text-stone-500 hover:text-red-400 font-mono text-xs cursor-pointer z-20"
                      >
                        ✕
                      </button>

                      <div className="flex flex-col gap-1 pr-4">
                        <span className="text-[9px] font-mono uppercase bg-amber-950 text-amber-300 px-1.5 py-0.5 border border-amber-900 w-max leading-none rounded-none">
                          📦 {card.deck}
                        </span>

                        {/* Interactive Flip Area */}
                        <div 
                          onClick={() => toggleCardFlip(card.id)}
                          className="mt-2 text-center py-4 bg-stone-950 p-2 border border-stone-800 cursor-pointer hover:bg-stone-900 select-none transition-all duration-300"
                        >
                          {isFlipped ? (
                            <div className="text-emerald-400 font-sans italic text-sm">
                              💡 {card.back}
                            </div>
                          ) : (
                            <div className="text-stone-200 font-sans font-semibold text-sm">
                              ❓ {card.front}
                            </div>
                          )}
                          <p className="text-[8px] font-mono text-stone-500 uppercase mt-4">Klik kartu untuk membalikkan</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
