import React, { useState } from 'react';
import { HealthTracker } from '../types';
import { playClickSound, playXPChime } from '../utils/audio';

interface HealthTrackerPanelProps {
  tracker: HealthTracker;
  onUpdateHealth: (updates: Partial<HealthTracker>) => void;
  triggerNotification: (title: string, desc: string, icon?: string) => void;
}

export default function HealthTrackerPanel({
  tracker,
  onUpdateHealth,
  triggerNotification
}: HealthTrackerPanelProps) {
  
  const [detoxDuration, setDetoxDuration] = useState(15);
  const [isDetoxActive, setIsDetoxActive] = useState(false);
  const [detoxLeft, setDetoxLeft] = useState(0);

  // Timer Ref
  React.useEffect(() => {
    let interval: any;
    if (isDetoxActive && detoxLeft > 0) {
      interval = setInterval(() => {
        setDetoxLeft(prev => {
          if (prev <= 1) {
            setIsDetoxActive(false);
            clearInterval(interval);
            playXPChime();
            onUpdateHealth({ screenTimeMinutes: Math.max(0, tracker.screenTimeMinutes - detoxDuration) });
            triggerNotification(
              "Detox Digital Selesai!",
              `Hebat! Sesi detox ${detoxDuration} menit menjaga matamu sehat. +30 XP!`,
              "🧴"
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isDetoxActive, detoxLeft]);

  const addWater = () => {
    playClickSound();
    const nextVal = Math.min(3000, tracker.waterMl + 250);
    onUpdateHealth({ waterMl: nextVal });
    
    if (nextVal === 2000) {
      triggerNotification("Hidrasi Penuh!", "Tubuhmu terasa segar maksimal (+20 XP)!", "🌊");
    }
  };

  const removeWater = () => {
    playClickSound();
    onUpdateHealth({ waterMl: Math.max(0, tracker.waterMl - 250) });
  };

  const addSleep = () => {
    playClickSound();
    onUpdateHealth({ sleepHours: Math.min(12, tracker.sleepHours + 0.5) });
  };

  const removeSleep = () => {
    playClickSound();
    onUpdateHealth({ sleepHours: Math.max(0, tracker.sleepHours - 0.5) });
  };

  const addExercise = (amount: number) => {
    playClickSound();
    onUpdateHealth({ exerciseMinutes: Math.min(180, tracker.exerciseMinutes + amount) });
  };

  const addScreenTime = (amount: number) => {
    playClickSound();
    onUpdateHealth({ screenTimeMinutes: Math.max(0, tracker.screenTimeMinutes + amount) });
  };

  const startDetox = () => {
    playClickSound();
    setDetoxLeft(detoxDuration * 60);
    setIsDetoxActive(true);
    triggerNotification("Detox Dimulai!", "Letakkan HP-mu sekarang dan pandanglah pemandangan luar!", "🌳");
  };

  const stopDetox = () => {
    playClickSound();
    setIsDetoxActive(false);
    setDetoxLeft(0);
  };

  const triggerEyeRest = () => {
    playClickSound();
    onUpdateHealth({ eyeRestReminders: tracker.eyeRestReminders + 1 });
    triggerNotification(
      "Peringatan Istirahat Mata!",
      "Alihkan pandangan 20 meter selama 20 detik sekarang (Aturan 20-20-20)!",
      "👁️"
    );
  };

  const formatDetoxTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* Detailing tracker columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* WATER COLUMN */}
        <div className="mc-panel-inner p-4 text-white text-center">
          <span className="text-3xl block mb-1">🥛</span>
          <h5 className="mc-font-pixel text-lg text-blue-400 font-bold uppercase leading-tight">AIR MINUM (WATER)</h5>
          
          <div className="my-3">
            <div className="text-3xl font-bold font-mono">{tracker.waterMl} <span className="text-sm">ml</span></div>
            <p className="text-[10px] text-stone-400 font-mono mt-1">Target harian minimum: 2000 ml</p>
          </div>

          <div className="flex gap-2 justify-center">
            <button 
              onClick={addWater}
              className="mc-btn flex-1 py-1 text-sm text-green-200"
            >
              + 250ML
            </button>
            {tracker.waterMl > 0 && (
              <button 
                onClick={removeWater}
                className="mc-btn mc-btn-danger max-w-[50px] py-1 text-sm text-red-200"
              >
                -
              </button>
            )}
          </div>
        </div>

        {/* SLEEP COLUMN */}
        <div className="mc-panel-inner p-4 text-white text-center">
          <span className="text-3xl block mb-1">🛌</span>
          <h5 className="mc-font-pixel text-lg text-amber-500 font-bold uppercase leading-tight">WAKTU TIDUR (SLEEP)</h5>

          <div className="my-3">
            <div className="text-3xl font-bold font-mono">{tracker.sleepHours} <span className="text-sm">jam</span></div>
            <p className="text-[10px] text-stone-400 font-mono mt-1">Estimasi tidur ideal: 7 - 8 jam</p>
          </div>

          <div className="flex gap-2 justify-center">
            <button 
              onClick={addSleep}
              className="mc-btn flex-1 py-1 text-sm"
            >
              + 30 Menit
            </button>
            {tracker.sleepHours > 0 && (
              <button 
                onClick={removeSleep}
                className="mc-btn mc-btn-danger max-w-[50px] py-1 text-sm text-red-200"
              >
                -
              </button>
            )}
          </div>
        </div>

        {/* EXERCISE / ACTIVITES */}
        <div className="mc-panel-inner p-4 text-white text-center">
          <span className="text-3xl block mb-1">🏃</span>
          <h5 className="mc-font-pixel text-lg text-[#70cf41] font-bold uppercase leading-tight">OLAHRAGA (EXERCISE)</h5>

          <div className="my-3">
            <div className="text-3xl font-bold font-mono">{tracker.exerciseMinutes} <span className="text-sm">menit</span></div>
            <p className="text-[10px] text-stone-400 font-mono mt-1">Target harian: 30 menit tetap aktif</p>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button 
              onClick={() => addExercise(15)}
              className="mc-btn text-xs py-1"
            >
              + 15m
            </button>
            <button 
              onClick={() => addExercise(30)}
              className="mc-btn text-xs py-1"
            >
              + 30m
            </button>
          </div>
        </div>

      </div>

      {/* DETOX MODE & EYE PIXEL REMINDER */}
      <div className="mc-panel-inner p-4 text-white">
        <h4 className="mc-font-pixel text-lg text-yellow-400 mb-2 flex items-center gap-2">
          👁️ KESEHATAN MATA & SCREEN TIME REMINDER
        </h4>
        <p className="font-mono text-xs text-stone-400 mb-3">
          Terlalu lama memandang layar komputer/laptop atau monitor? Kurangi kelelahan lensa matamu sekarang.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
          
          {/* Column A: Quick eye rest check */}
          <div className="flex flex-col gap-2 bg-stone-900 border border-stone-800 p-3 text-center">
            <h5 className="font-semibold text-xs uppercase text-stone-300">Peringatan 20 Menit Layar</h5>
            <div className="text-xl font-bold font-mono text-amber-400">{tracker.eyeRestReminders} Istirahat</div>
            <button
              onClick={triggerEyeRest}
              className="mc-btn py-1 px-3 text-xs w-full"
            >
              👁️ ISTIRAHATKAN MATA SEKARANG (20 DETIK)
            </button>
          </div>

          {/* Column B: Detox digital active countdown */}
          <div className="flex flex-col gap-2 bg-stone-950/40 p-3 border border-purple-900">
            <h5 className="font-semibold text-xs uppercase text-purple-400">🚪 DIGITAL DETOX BAR CLOCK</h5>
            {isDetoxActive ? (
              <div className="text-center py-1">
                <p className="text-xs text-yellow-400 uppercase font-bold animate-pulse">DETOX BERLANGSUNG</p>
                <p className="mc-font-pixel text-3xl font-bold text-white tracking-widest my-1">
                  {formatDetoxTime(detoxLeft)}
                </p>
                <button
                  onClick={stopDetox}
                  className="mc-btn mc-btn-danger text-xs px-3 py-1 font-mono cursor-pointer"
                >
                  BATALKAN DETOX
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2 items-center mb-2">
                  <span className="text-xs text-stone-300 font-mono mr-2">WAKTU:</span>
                  {[5, 15, 30, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDetoxDuration(mins)}
                      className={`p-1 px-2 text-[10px] font-mono border ${
                        detoxDuration === mins ? 'bg-purple-900 text-white' : 'bg-stone-900 text-stone-400'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                <button
                  onClick={startDetox}
                  className="mc-btn py-1 text-xs w-full uppercase"
                >
                  🔥 PETUALANGAN DETOX (LOCK SCREEN)
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
