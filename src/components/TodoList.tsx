import React, { useState } from 'react';
import { Todo, Subtask } from '../types';
import { playClickSound, playXPChime, playHurtSound } from '../utils/audio';

interface TodoListProps {
  todos: Todo[];
  lifeAreas: string[];
  onAddTodo: (title: string, priority: Todo['priority'], difficulty: Todo['difficulty'], category: string, deadline?: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onAddSubtask: (todoId: string, title: string) => void;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
  onUpdateSubtasks: (todoId: string, steps: { title: string; completed: boolean }[]) => void;
  triggerNotification: (title: string, desc: string, icon?: string) => void;
}

export default function TodoList({
  todos,
  lifeAreas,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtasks,
  triggerNotification
}: TodoListProps) {
  
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState<Todo['priority']>('Diamond');
  const [difficulty, setDifficulty] = useState<Todo['difficulty']>('Normal');
  const [category, setCategory] = useState(lifeAreas[0] || 'Belajar');
  const [deadline, setDeadline] = useState('');
  const [subtaskInputs, setSubtaskInputs] = useState<{ [todoId: string]: string }>({});
  
  // AI state
  const [loadingBreakdowns, setLoadingBreakdowns] = useState<{ [todoId: string]: boolean }>({});

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    playClickSound();
    onAddTodo(newTitle, priority, difficulty, category, deadline || undefined);
    setNewTitle('');
    setDeadline('');
  };

  // Trigger server-side Smart Task Breakdown via AI
  const handleAIBreakdown = async (todo: Todo) => {
    playClickSound();
    setLoadingBreakdowns(prev => ({ ...prev, [todo.id]: true }));
    
    try {
      const response = await fetch('/api/ai/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: todo.title,
          priority: todo.priority,
          difficulty: todo.difficulty
        })
      });

      if (!response.ok) throw new Error("Gagal mengambil respon AI");
      const data = await response.json();
      
      if (data.subtasks && Array.isArray(data.subtasks)) {
        onUpdateSubtasks(todo.id, data.subtasks);
        playXPChime();
        triggerNotification(
          "Quest Terurai!",
          `AI memecah "${todo.title}" menjadi subtasks otomatis!`,
          "🔮"
        );
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memanggil Minecraft AI Coach. Periksa koneksi internet.");
    } finally {
      setLoadingBreakdowns(prev => ({ ...prev, [todo.id]: false }));
    }
  };

  const handleAddSubtaskSubmit = (todoId: string) => {
    const input = subtaskInputs[todoId] || '';
    if (!input.trim()) return;
    playClickSound();
    onAddSubtask(todoId, input);
    setSubtaskInputs(prev => ({ ...prev, [todoId]: '' }));
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* 1. Add Block Frame */}
      <div className="mc-panel-inner p-4 text-white">
        <h4 className="mc-font-pixel text-xl text-yellow-400 mb-3 flex items-center gap-2">
          🔨 TAMBAH QUEST BARU (TO-DO)
        </h4>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <input 
            type="text"
            className="w-full bg-stone-900 border-2 border-stone-700 p-2 text-stone-200 outline-none placeholder-stone-500 font-sans"
            placeholder="Ketik tugasmu disini..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            
            {/* Priority Select */}
            <div className="flex flex-col gap-1">
              <label className="mc-font-pixel text-xs text-stone-400">PRIORITAS:</label>
              <select 
                className="bg-stone-900 border-2 border-stone-700 p-1 text-stone-200 text-xs mc-font-pixel shrink-0 h-9"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Todo['priority'])}
              >
                <option value="Netherite">🔥 Netherite (Tinggi)</option>
                <option value="Diamond">💎 Diamond (Sedang)</option>
                <option value="Iron">🛡️ Iron (Rendah)</option>
                <option value="Wooden">🪵 Wooden (Backlog)</option>
              </select>
            </div>

            {/* Difficulty Select */}
            <div className="flex flex-col gap-1">
              <label className="mc-font-pixel text-xs text-stone-400">KESULITAN:</label>
              <select 
                className="bg-stone-900 border-2 border-stone-700 p-1 text-stone-200 text-xs mc-font-pixel shrink-0 h-9"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Todo['difficulty'])}
              >
                <option value="Ender">👾 Boss Ender (Sulit)</option>
                <option value="Nether">🔥 Nether (Normal)</option>
                <option value="Normal">🌿 Overworld (Mudah)</option>
              </select>
            </div>

            {/* Category Area Select */}
            <div className="flex flex-col gap-1">
              <label className="mc-font-pixel text-xs text-stone-400">BIDANG HIDUP:</label>
              <select 
                className="bg-stone-900 border-2 border-stone-700 p-1 text-stone-200 text-xs mc-font-pixel shrink-0 h-9"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {lifeAreas.map((area) => (
                  <option key={area} value={area}>📦 {area}</option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div className="flex flex-col gap-1">
              <label className="mc-font-pixel text-xs text-stone-400">DEADLINE:</label>
              <input 
                type="date"
                className="bg-stone-900 border-2 border-stone-700 p-1 text-stone-200 text-xs h-9"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

          </div>

          <button 
            type="submit" 
            className="mc-btn w-full py-2 text-lg active:scale-95 transition-transform"
          >
            + BUAT RENCANA QUEST (+XP)
          </button>
        </form>
      </div>

      {/* 2. Eisenhower Matrix Toggle Helper Info */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-red-950/40 p-2 border border-red-900 text-stone-300 text-xs">
          <p className="font-mono text-[10px] text-red-400 uppercase font-bold mb-1">🔥 URGENT & IMPORTANT (Netherite-Ender)</p>
          <span className="font-mono">Fokus utama sekarang! Segera selesaikan bos ini.</span>
        </div>
        <div className="bg-sky-950/40 p-2 border border-sky-900 text-stone-300 text-xs">
          <p className="font-mono text-[10px] text-sky-400 uppercase font-bold mb-1">📅 SCHEDULE (Diamond-Nether)</p>
          <span className="font-mono">Atur jadwal di Planner dan kalender untuk nanti.</span>
        </div>
      </div>

      {/* 3. List Content */}
      <div className="flex flex-col gap-3">
        {todos.length === 0 ? (
          <div className="p-8 text-center bg-stone-900/30 border-4 border-dashed border-stone-700">
            <span className="text-3xl block mb-2 opacity-50">🐉</span>
            <p className="mc-font-pixel text-stone-400 text-xl uppercase">Dunia Aman! Tidak ada Quest Tersisa.</p>
            <p className="text-xs text-stone-500 font-mono mt-1">Buat tugas pertamamu di atas untuk menambang XP.</p>
          </div>
        ) : (
          todos.map((todo) => {
            const priorityBadgeColor = 
              todo.priority === "Netherite" ? "bg-purple-900 text-purple-200 border-purple-700" :
              todo.priority === "Diamond" ? "bg-sky-900 text-sky-200 border-sky-700" :
              todo.priority === "Iron" ? "bg-stone-700 text-stone-200 border-stone-500" :
              "bg-amber-900 text-amber-200 border-amber-700";

            return (
              <div 
                key={todo.id}
                className={`p-3 mc-panel-dark text-stone-200 border-l-8 ${todo.completed ? 'opacity-60 border-l-green-600' : 'border-l-yellow-600'}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-start gap-2 max-w-[70%]">
                    <input 
                      type="checkbox"
                      className="w-5 h-5 shrink-0 accent-green-600 mt-1 cursor-pointer"
                      checked={todo.completed}
                      onChange={() => {
                        playXPChime();
                        onToggleTodo(todo.id);
                      }}
                    />
                    <div>
                      <h5 className={`font-medium ${todo.completed ? 'line-through text-stone-500' : 'text-stone-100'}`}>
                        {todo.title}
                      </h5>
                      
                      {/* Meta badges row */}
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 border-2 ${priorityBadgeColor}`}>
                          {todo.priority}
                        </span>
                        <span className="text-[10px] font-mono bg-pink-950/40 text-pink-300 border-2 border-pink-900/40 px-1.5 py-0.5">
                          💀 {todo.difficulty}
                        </span>
                        <span className="text-[10px] font-mono bg-stone-900 text-yellow-300 border-2 border-stone-600 px-1.5 py-0.5">
                          🗳️ {todo.category}
                        </span>
                        {todo.deadline && (
                          <span className="text-[10px] font-mono bg-blue-900 text-blue-100 border border-blue-700 px-1.5 py-0.5">
                            📅 {todo.deadline}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5">
                    
                    {/* WAND SMART BREAKDOWN AI */}
                    {!todo.completed && (
                      <button 
                        onClick={() => handleAIBreakdown(todo)}
                        disabled={loadingBreakdowns[todo.id]}
                        className="p-1 px-2 text-xs bg-purple-900/80 hover:bg-purple-800 text-purple-200 rounded border border-purple-700 select-none cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95"
                        title="Dapatkan Smart AI breakdown steps!"
                      >
                        {loadingBreakdowns[todo.id] ? "⌛..." : "🔮 AI"}
                      </button>
                    )}

                    {/* DELETE */}
                    <button 
                      onClick={() => {
                        playHurtSound();
                        onDeleteTodo(todo.id);
                      }}
                      className="p-1 px-2 text-xs bg-red-950/80 hover:bg-red-900 text-red-200 rounded border border-red-800 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {/* Subtasks block */}
                <div className="mt-3 ml-6 pl-3 border-l-2 border-stone-800/15">
                  {todo.subtasks && todo.subtasks.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-2 my-1 text-sm">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 accent-green-600 cursor-pointer"
                        checked={sub.completed}
                        onChange={() => {
                          playClickSound();
                          onToggleSubtask(todo.id, sub.id);
                        }}
                      />
                      <span className={`text-stone-300 ${sub.completed ? 'line-through text-stone-500' : ''}`}>
                        {sub.title}
                      </span>
                    </div>
                  ))}

                  {/* Manual add subtask input */}
                  {!todo.completed && (
                    <div className="flex gap-1.5 items-center mt-2">
                      <input 
                        type="text"
                        className="bg-stone-900 border border-stone-700 p-1 text-xs text-stone-200 outline-none placeholder-stone-500 w-full"
                        placeholder="Tambah subtask..."
                        value={subtaskInputs[todo.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSubtaskInputs(prev => ({ ...prev, [todo.id]: val }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddSubtaskSubmit(todo.id);
                        }}
                      />
                      <button 
                        onClick={() => handleAddSubtaskSubmit(todo.id)}
                        className="text-xs bg-stone-800 border border-stone-600 text-stone-200 px-2 py-1 hover:bg-stone-700 shrink-0 cursor-pointer"
                      >
                        Tambah
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
