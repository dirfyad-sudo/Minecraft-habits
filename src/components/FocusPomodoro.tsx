import React, { useState, useEffect, useRef } from 'react';
import { playClickSound, playXPChime, playHurtSound, toggleStudyMelody, isMelodyPlaying } from '../utils/audio';

interface FocusPomodoroProps {
  onAddFocusMinutes: (minutes: number) => void;
  triggerNotification: (title: string, desc: string, icon?: string) => void;
}

export default function FocusPomodoro({ onAddFocusMinutes, triggerNotification }: FocusPomodoroProps) {
  // Mode selection: "pomodoro" or "deep"
  const [mode, setMode] = useState<'pomodoro' | 'deep'>('pomodoro');
  
  // Pomodoro States
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [isBreakTime, setIsBreakTime] = useState(false);

  // Deep Work States
  const [deepMinutes, setDeepMinutes] = useState(0);
  const [deepSeconds, setDeepSeconds] = useState(0);
  const [isDeepRunning, setIsDeepRunning] = useState(false);

  // Sound States
  const [isMscActive, setIsMscActive] = useState(isMelodyPlaying());

  // Timer Ref
  const pInterval = useRef<any>(null);
  const dInterval = useRef<any>(null);

  // Handle melody toggle
  const handleMusicToggle = () => {
    playClickSound();
    const isActive = toggleStudyMelody();
    setIsMscActive(isActive);
    triggerNotification(
      isActive ? "Lagu Aktif!" : "Lagu Senyap",
      isActive ? "Musik tenang bergaya Minecraft diputar..." : "Musik dihentikan.",
      "🎵"
    );
  };

  // Pomodoro counting
  useEffect(() => {
    if (isPomoRunning) {
      pInterval.current = setInterval(() => {
        if (pomoSeconds > 0) {
          setPomoSeconds(prev => prev - 1);
        } else if (pomoSeconds === 0) {
          if (pomoMinutes === 0) {
            // Finished a cycle!
            setIsPomoRunning(false);
            clearInterval(pInterval.current);
            
            if (!isBreakTime) {
              // Focused!
              playXPChime();
              onAddFocusMinutes(25);
              triggerNotification(
                "Siklus Fokus Selesai!",
                "Hebat! +50 XP diraih. Istirahat 5 menit sekarang.",
                "💎"
              );
              setIsBreakTime(true);
              setPomoMinutes(5);
              setPomoSeconds(0);
            } else {
              // Finished break!
              playXPChime();
              triggerNotification(
                "Waktunya Bertualang!",
                "Istirahat selesai, kembali fokus untuk menambang produktivitas!",
                "🛡️"
              );
              setIsBreakTime(false);
              setPomoMinutes(25);
              setPomoSeconds(0);
            }
          } else {
            setPomoMinutes(prev => prev - 1);
            setPomoSeconds(59);
          }
        }
      }, 1000);
    } else {
      clearInterval(pInterval.current);
    }

    return () => clearInterval(pInterval.current);
  }, [isPomoRunning, pomoMinutes, pomoSeconds, isBreakTime]);

  // Deep work counting
  useEffect(() => {
    if (isDeepRunning) {
      dInterval.current = setInterval(() => {
        if (deepSeconds < 59) {
          setDeepSeconds(prev => prev + 1);
        } else {
          setDeepSeconds(0);
          setDeepMinutes(prev => {
            const nextMin = prev + 1;
            // Every 1 minute, award XP
            onAddFocusMinutes(1);
            if (nextMin % 10 === 0) {
              triggerNotification("Fokus Berlanjut!", `Kamu telah fokus mendalam selama ${nextMin} menit!`, "🔋");
            }
            return nextMin;
          });
        }
      }, 1000);
    } else {
      clearInterval(dInterval.current);
    }

    return () => clearInterval(dInterval.current);
  }, [isDeepRunning, deepSeconds, deepMinutes]);

  // Toggle Pomo
  const handlePomoControl = () => {
    playClickSound();
    setIsPomoRunning(!isPomoRunning);
  };

  // Reset Pomo
  const handlePomoReset = () => {
    playHurtSound();
    setIsPomoRunning(false);
    setIsBreakTime(false);
    setPomoMinutes(25);
    setPomoSeconds(0);
  };

  // Toggle Deep
  const handleDeepControl = () => {
    playClickSound();
    setIsDeepRunning(!isDeepRunning);
  };

  // Save and Stop Deep
  const handleDeepStop = () => {
    playHurtSound();
    setIsDeepRunning(false);
    if (deepMinutes > 0) {
      playXPChime();
      triggerNotification(
        "Fokus Tersimpan!",
        `Kamu mencatat ${deepMinutes} menit Deep Work! XP berhasil ditambahkan.`,
        "⭐"
      );
    }
    setDeepMinutes(0);
    setDeepSeconds(0);
  };

  // Format Helper
  const formatTime = (m: number, s: number) => {
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* 1. Tabs */}
      <div className="flex bg-stone-900 border border-stone-800 p-1">
        <button
          onClick={() => { playClickSound(); setMode('pomodoro'); }}
          className={`flex-1 py-1.5 mc-font-pixel uppercase text-base transition-colors cursor-pointer ${
            mode === 'pomodoro' ? 'bg-[#3c8527] text-white border-b-2 border-green-700' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          ⏱️ POMODORO TIMER
        </button>
        <button
          onClick={() => { playClickSound(); setMode('deep'); }}
          className={`flex-1 py-1.5 mc-font-pixel uppercase text-base transition-colors cursor-pointer ${
            mode === 'deep' ? 'bg-[#3c8527] text-white border-b-2 border-green-700' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          ⚔️ DEEP WORK CHRONO
        </button>
      </div>

      {mode === 'pomodoro' ? (
        /* POMODORO RENDER */
        <div className="mc-panel-inner p-6 text-center text-white relative overflow-hidden">
          <div className="absolute top-2 right-2 px-2 py-0.5 font-mono text-[10px] bg-red-950 text-red-300 border border-red-800 uppercase animate-pulse">
            {isBreakTime ? "☕ Istirahat" : "⚔️ Sesi Fokus"}
          </div>

          <div className="mc-font-pixel text-6xl tracking-wider font-extrabold text-[#70cf41] text-shadow-glow my-3 selection:bg-none">
            {formatTime(pomoMinutes, pomoSeconds)}
          </div>

          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={handlePomoControl}
              className={`mc-btn p-2 px-5 min-w-[120px] text-base ${isPomoRunning ? "bg-amber-700 border-amber-900" : ""}`}
            >
              {isPomoRunning ? "⏸ PAUSE" : "▶ MULAI"}
            </button>
            <button
              onClick={handlePomoReset}
              className="mc-btn mc-btn-danger p-2 px-5 text-base"
            >
              🔄 RESET
            </button>
          </div>

          <p className="text-stone-400 text-xs font-mono mt-4">
            Menyelesaikan 1 siklus fokus (25 menit) memberikan +50 XP. Istirahat 5 menit membantu menyegarkan stamina bar.
          </p>
        </div>
      ) : (
        /* DEEP WORK CHRONO */
        <div className="mc-panel-inner p-6 text-center text-white relative">
          <div className="absolute top-2 right-2 px-2 py-0.5 font-mono text-[10px] bg-sky-950 text-sky-300 border border-sky-800 uppercase">
            ⚡ Pengukuran Waktu
          </div>

          <div className="mc-font-pixel text-6xl tracking-wider font-extrabold text-sky-400 text-shadow-glow my-3 selection:bg-none">
            {formatTime(deepMinutes, deepSeconds)}
          </div>

          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={handleDeepControl}
              className={`mc-btn p-2 px-5 min-w-[120px] text-base ${isDeepRunning ? "bg-amber-700 border-amber-900" : ""}`}
            >
              {isDeepRunning ? "⏸ PAUSE" : "▶ START"}
            </button>
            {deepMinutes > 0 && (
              <button
                onClick={handleDeepStop}
                className="mc-btn bg-blue-800 border-blue-900 p-2 px-5 text-base"
              >
                💾 SAVE FOCUS
              </button>
            )}
          </div>

          <p className="text-stone-400 text-xs font-mono mt-4">
            Chronograph melacak berapa lama kamu benar-benar berfokus tanpa terputus. +2 XP per menit didapatkan otomatis ke dalam level!
          </p>
        </div>
      )}

      {/* AMBIENT PROCEDURE SOUND CHIP BOX */}
      <div className="mc-panel bg-stone-900 text-white p-3 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <span className="text-lg animate-bounce">🎶</span>
          <div>
            <p className="mc-font-pixel text-[13px] text-yellow-400 font-bold leading-tight">LAGU CALM STAL-LOFI (MOCK-OST)</p>
            <p className="font-mono text-[10px] text-stone-400">Musik piano pentatonik buatan generator web audio</p>
          </div>
        </div>
        <button
          onClick={handleMusicToggle}
          className={`mc-btn p-1 px-3 text-xs ${isMscActive ? 'bg-green-700' : 'bg-stone-700'}`}
        >
          {isMscActive ? "🔊 PLAYING" : "🔇 MUTED"}
        </button>
      </div>

    </div>
  );
}
