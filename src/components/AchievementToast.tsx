import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playXPChime } from '../utils/audio';

interface ToastData {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface AchievementToastProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export default function AchievementToast({ toasts, onRemove }: AchievementToastProps) {
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          // Play sounds when a sliding advancement is initialized
          return (
            <motion.div
              key={toast.id}
              initial={{ x: 100, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 15 }}
              className="pointer-events-auto bg-[#2e261f] border-4 border-[#3c3024] p-3 shadow-lg flex items-center gap-3 relative max-w-sm"
              style={{
                boxShadow: 'inset -2px -2px 0px 0px #1a140f, inset 2px 2px 0px 0px #4e3d2f, 0 4px 6px -1px rgb(0 0 0 / 0.5)'
              }}
            >
              {/* Voxel Icon Container */}
              <div className="w-12 h-12 bg-stone-900 border-2 border-amber-500 flex items-center justify-center text-3xl shrink-0 p-1">
                {toast.icon || "🏆"}
              </div>

              {/* Text */}
              <div className="flex flex-col">
                <span className="mc-font-pixel text-[#ffaa00] text-sm uppercase tracking-widest font-extrabold leading-none mb-1">
                  Pencapaian Diraih!
                </span>
                <span className="mc-font-pixel text-[#ffffff] text-lg font-bold leading-tight">
                  {toast.title}
                </span>
                <span className="text-[11px] text-stone-300 font-mono italic">
                  {toast.description}
                </span>
              </div>
              
              {/* Close Button */}
              <button 
                onClick={() => onRemove(toast.id)}
                className="absolute top-1 right-1 text-xs text-stone-400 hover:text-white cursor-pointer px-1 font-mono"
              >
                ✕
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
