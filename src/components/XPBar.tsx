import React from 'react';
import { playXPChime } from '../utils/audio';

interface XPBarProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  waterMl: number; // Max 2000 ml
  sleepHours: number; // Decent indicator max 8 hours
  activeStreak: number;
}

export default function XPBar({ 
  level, 
  xp, 
  xpToNextLevel, 
  waterMl, 
  sleepHours,
  activeStreak
}: XPBarProps) {
  
  const xpPercent = Math.min(100, Math.max(0, (xp / xpToNextLevel) * 100));

  // Render Hearts for Water hydration level (each heart = 250ml, total 8 hearts = 2000ml)
  const heartsCount = 8;
  const fullHearts = Math.min(heartsCount, Math.floor(waterMl / 250));
  const hasHalfHeart = waterMl % 250 >= 120;

  // Render Drumsticks (Hunger) for sleep quality (each chop = 1 hr (total 8 hours))
  const drumsticksCount = 8;
  const fullDrumsticks = Math.min(drumsticksCount, Math.floor(sleepHours));
  
  return (
    <div className="w-full flex flex-col items-center gap-3 py-4 px-3 bg-stone-900 border-b-8 border-stone-950 text-white select-none">
      
      {/* Top statistics rows: Streak and Level */}
      <div className="w-full max-w-md flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 text-xl animate-pulse">🔥</span>
          <span className="mc-font-pixel text-xl tracking-wider text-orange-400">STREAK: {activeStreak} HARI</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-xl">✨</span>
          <span className="mc-font-pixel text-xl text-yellow-300">DUNIA UTAMA</span>
        </div>
      </div>

      {/* Experience level number display */}
      <div className="text-center relative">
        <span className="mc-font-pixel text-xs text-green-400 font-bold uppercase tracking-widest block mb-1">
          XP PETUALANG: {xp}/{xpToNextLevel}
        </span>
        <div className="mc-font-pixel text-4xl font-extrabold text-green-400 text-shadow-glow">
          {level}
        </div>
      </div>

      {/* Centered green segmented XP bar */}
      <div className="w-full max-w-md h-5 bg-stone-950 border-2 border-stone-800 p-0.5 relative flex overflow-hidden">
        <div 
          className="h-full bg-linear-to-r from-green-500 via-green-400 to-green-500 shadow-[inset_0_2px_0_rgba(255,255,255,0.4)] transition-all duration-300"
          style={{ width: `${xpPercent}%` }}
        />
        {/* Bar notches for retro segment feeling */}
        <div className="absolute inset-y-0 left-1/4 w-0.5 bg-stone-950/40"></div>
        <div className="absolute inset-y-0 left-2/4 w-0.5 bg-stone-950/40"></div>
        <div className="absolute inset-y-0 left-3/4 w-0.5 bg-stone-950/40"></div>
      </div>

      {/* Hearts (Hydration) & Drumsticks (Sleep) HUD Panel */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4 mt-2 bg-stone-950/60 p-2 border border-stone-800">
        
        {/* HP Hearts: Air (Water Intake) */}
        <div className="flex flex-col gap-1 items-start">
          <span className="mc-font-pixel text-xs tracking-wider text-red-500 uppercase">
            HIDRASI AIR ({waterMl}ml):
          </span>
          <div className="flex flex-wrap gap-0.5 select-none my-0.5">
            {Array.from({ length: heartsCount }).map((_, i) => {
              let heartEmoji = "🖤"; // empty
              if (i < fullHearts) {
                heartEmoji = "❤️"; // full red heart
              } else if (i === fullHearts && hasHalfHeart) {
                heartEmoji = "💔"; // half heart
              }
              return (
                <span 
                  key={i} 
                  className={`text-lg transition-transform duration-200 ${heartEmoji !== "🖤" ? "hover:scale-125 cursor-pointer" : "opacity-30"}`}
                  title={`${(i+1)*250} ml`}
                >
                  {heartEmoji}
                </span>
              );
            })}
          </div>
        </div>

        {/* Hunger Bar Chops: Tidur (Sleep hours) */}
        <div className="flex flex-col gap-1 items-start">
          <span className="mc-font-pixel text-xs tracking-wider text-amber-500 uppercase">
            STAMINA TIDUR ({sleepHours} jam):
          </span>
          <div className="flex flex-wrap gap-0.5 select-none my-0.5">
            {Array.from({ length: drumsticksCount }).map((_, i) => {
              const isFilled = i < fullDrumsticks;
              return (
                <span 
                  key={i} 
                  className={`text-lg transition-transform duration-200 ${isFilled ? "hover:scale-125 cursor-pointer" : "opacity-30"}`}
                  title={`${i+1} jam tidur`}
                >
                  {isFilled ? "🍖" : "🦴"}
                </span>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
