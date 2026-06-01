import React from 'react';
import { Achievement } from '../types';
import { playClickSound, playXPChime, playHurtSound } from '../utils/audio';

interface AchievementsProps {
  userXP: number;
  unlockedItems: string[];
  onDeductXP: (amount: number, itemId: string) => void;
  triggerNotification: (title: string, desc: string, icon?: string) => void;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  costXp: number;
  icon: string; // emoji representing item
}

export default function Achievements({
  userXP,
  unlockedItems,
  onDeductXP,
  triggerNotification
}: AchievementsProps) {
  
  // Static Achievements
  const achievementsList: Achievement[] = [
    { id: '1', title: 'Pertahankan Obor', description: 'Mulai petualangan dengan menulis tugas harian pertamamu.', unlocked: true, icon: '🕯️' },
    { id: '2', title: 'Masuk Ke Tambang (Miners!)', description: 'Lembur 25 menit sesi Pomodoro penuh konsentrasi.', unlocked: unlockedItems.includes('wooden_pickaxe') || unlockedItems.includes('iron_pickaxe'), icon: '⛏️' },
    { id: '3', title: 'Kekuatan Berlian', description: 'Miliki Level XP bar hingga mencapai Level 5 petualang.', unlocked: userXP > 500, icon: '💎' },
    { id: '4', title: 'Redstone Scheduler', description: 'Tuliskan dan petakan 3 daftar agenda waktu harian.', unlocked: true, icon: '⚙️' }
  ];

  // Shop Items list
  const shopItems: ShopItem[] = [
    { id: 'golden_apple', name: 'Apel Emas (Golden Apple)', description: 'Isi ulang stamina mental, berikan efek fokus sehat.', costXp: 100, icon: '🍎' },
    { id: 'diamond_pickaxe', name: 'Beliung Berlian (Diamond Pickaxe)', description: 'Mempermudah pengerjaan tugas berat bermutu tinggi.', costXp: 250, icon: '⛏️' },
    { id: 'diamond_sword', name: 'Pedang Ender (Diamond Sword)', description: 'Mengusir Phantoms stres dan rasa malas yang berhadapan.', costXp: 500, icon: '⚔️' },
    { id: 'enchanted_book', name: 'Buku Sihir (Enchanted Book)', description: 'Meningkatkan fokus belajar, memberikan efek tenang ganda.', costXp: 300, icon: '📖' },
    { id: 'minecraft_cake', name: 'Kue Pesta (Minecraft Cake)', description: 'Kue perayaan pencapaian mingguan, bagikan energi positif.', costXp: 150, icon: '🎂' }
  ];

  const buyItem = (item: ShopItem) => {
    if (unlockedItems.includes(item.id)) {
      alert("Kamu sudah memiliki item ini di inventory!");
      return;
    }

    if (userXP < item.costXp) {
      playHurtSound();
      alert(`Kekuatan XP-mu tidak cukup! Butuh ${item.costXp} XP, sedangkan kamu baru mengoleksi ${userXP} XP.`);
      return;
    }

    playClickSound();
    playXPChime();
    onDeductXP(item.costXp, item.id);
    triggerNotification(
      "Alat Ditempa!",
      `Membeli ${item.name} seharga ${item.costXp} XP! Item tersimpan di inventory.`,
      item.icon
    );
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* 1. CHARACTER INVENTORY FRAME */}
      <div className="mc-panel p-4 text-stone-800 bg-stone-300">
        <h4 className="mc-font-pixel text-xl text-stone-900 border-b border-stone-400 pb-1 mb-3 flex items-center gap-2">
          🎒 TAS INVENTORY KARAKTER STEVE-MU
        </h4>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          
          {/* Character visual mockup */}
          <div className="w-24 h-24 bg-stone-400 border-4 border-stone-600 flex items-center justify-center p-2 rounded-none relative shrink-0">
            <span className="text-5xl">🧑</span>
            <span className="absolute bottom-1 right-1 text-xs font-mono bg-stone-900 text-white px-1 leading-none font-bold">LV.1</span>
          </div>

          <div className="flex-1 w-full">
            <p className="font-mono text-xs text-stone-600 mb-2 font-semibold">ITEM TERPASANG:</p>
            {unlockedItems.length === 0 ? (
              <div className="p-3 bg-stone-400 border border-stone-500 text-center font-mono text-[11px] text-stone-600">
                Inventory kosong. Selesaikan misi (Quests) untuk menambang XP and belanjalah di toko armor di bawah!
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {unlockedItems.map((id) => {
                  const details = shopItems.find(item => item.id === id);
                  return (
                    <div 
                      key={id} 
                      className="mc-slot w-12 h-12 flex items-center justify-center text-2xl relative select-none cursor-pointer group"
                      title={details?.name || id}
                    >
                      {details?.icon || "📦"}
                      {/* Hover details label tip */}
                      <span className="absolute bottom-0 right-1 text-[10px] font-bold font-mono text-stone-900">1</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 2. THE MINECRAFT ARMOR/COSMETIC SHOP */}
      <div className="mc-panel-inner p-4 text-white">
        <h4 className="mc-font-pixel text-xl text-yellow-500 mb-1">🛒 TOKO PENALATAN ARMOR & ALAT PETUALANG</h4>
        <p className="text-[11px] text-stone-400 font-mono mb-3">Tukarkan total XP bar-mu dengan item dewa legendaris yang memotivasi fokusmu sehari-hari!</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {shopItems.map((item) => {
            const isOwned = unlockedItems.includes(item.id);
            return (
              <div 
                key={item.id}
                className={`p-3 bg-[#1e1915] border-2 flex gap-3 items-center justify-between transition-all ${
                  isOwned ? 'border-green-800' : 'border-[#4e3d2f]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-stone-900 border-2 border-stone-700 flex items-center justify-center text-2xl shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h5 className="font-bold font-sans text-xs text-yellow-300">{item.name}</h5>
                    <p className="text-[10px] text-stone-400 font-mono leading-tight mt-0.5">{item.description}</p>
                    <span className="text-[10px] font-mono text-purple-400 font-bold block mt-1">Biaya: {item.costXp} XP</span>
                  </div>
                </div>

                <button
                  onClick={() => buyItem(item)}
                  disabled={isOwned}
                  className={`mc-btn p-1 px-3 text-xs shrink-0 ${
                    isOwned ? 'bg-green-800/20 text-green-500 hover:bg-green-800/20 cursor-not-allowed border-green-900 shadow-none' : ''
                  }`}
                >
                  {isOwned ? "DIMILIKI" : "BELI"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ACHIEVEMENTS MILESTONES (ADVANCEMENT CHEST!) */}
      <div className="flex flex-col gap-2.5">
        <h5 className="mc-font-pixel text-[15px] font-bold text-stone-300 uppercase">🏆 BUKU PENGHARGAAAN ADVANCEMENT INDONESIA:</h5>
        <div className="flex flex-col gap-2">
          {achievementsList.map((a) => (
            <div 
              key={a.id} 
              className={`p-3 border-2 flex items-center gap-3 ${
                a.unlocked 
                  ? 'bg-emerald-950/20 border-emerald-900 text-emerald-300' 
                  : 'bg-stone-900/10 border-stone-800 text-stone-500'
              }`}
            >
              <div className="text-2xl shrink-0">{a.icon}</div>
              <div>
                <h6 className="mc-font-pixel text-base font-bold uppercase leading-none mb-1">{a.title}</h6>
                <p className="font-sans text-[11px] leading-tight text-stone-400">{a.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
