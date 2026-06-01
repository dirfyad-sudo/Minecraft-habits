import React, { useState, useEffect } from 'react';
import { 
  UserProfile, Todo, Habit, Goal, Journal, HealthTracker, StudyRoadmap, Flashcard 
} from './types';
import { 
  isOfflineMode, db, auth, getLocalUser, setLocalUser, onAuthStateChanged, signInWithGoogle, signOutUser, handleFirestoreError, OperationType 
} from './lib/firebase';
import { 
  testConnection, syncUserProfile, syncTodo, removeTodo, syncHabit, removeHabit, syncJournal, syncTracker, syncRoadmap, removeRoadmap, syncFlashcard, removeFlashcard 
} from './lib/firestoreSync';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where } from 'firebase/firestore';

// Sound synthese
import { playClickSound, playXPChime } from './utils/audio';

// Components imports
import XPBar from './components/XPBar';
import PixelCard from './components/PixelCard';
import AchievementToast from './components/AchievementToast';
import TodoList from './components/TodoList';
import HabitTracker from './components/HabitTracker';
import FocusPomodoro from './components/FocusPomodoro';
import DailyReflector from './components/DailyReflector';
import HealthTrackerPanel from './components/HealthTrackerPanel';
import StudyPlanner from './components/StudyPlanner';
import AICoach from './components/AICoach';
import AnalyticsPanel from './components/AnalyticsPanel';
import Achievements from './components/Achievements';

export default function App() {
  // 1. Auth states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [gamerTag, setGamerTag] = useState('');
  
  // 2. Main screen panel selection based on Minecraft Hotbar
  const [activeSlot, setActiveSlot] = useState(0); // 0 to 8

  // 3. Notification system (Advancement toasts)
  const [toasts, setToasts] = useState<{ id: string; title: string; description: string; icon?: string }[]>([]);

  // 4. Client State arrays (Firestore mirrored / LocalStorage fallback)
  const [profile, setProfile] = useState<UserProfile>({
    uid: 'local_steve',
    email: 'local@minecraft.net',
    displayName: 'Steve',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    streak: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    inventory: [],
    lifeAreas: ['Belajar', 'Kesehatan', 'Keuangan', 'Sosial'],
    createdAt: new Date().toISOString()
  });

  const [todos, setTodos] = useState<Todo[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [roadmaps, setRoadmaps] = useState<StudyRoadmap[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [healthToday, setHealthToday] = useState<HealthTracker>({
    id: 'health_default',
    userId: 'local_steve',
    date: new Date().toISOString().split('T')[0],
    waterMl: 0,
    sleepHours: 0,
    exerciseMinutes: 0,
    screenTimeMinutes: 0,
    eyeRestReminders: 0,
    createdAt: new Date().toISOString()
  });
  const [healthHistory, setHealthHistory] = useState<HealthTracker[]>([]);

  // Real-time Firestore listeners list
  const [activeListeners, setActiveListeners] = useState<(() => void)[]>([]);

  // 0. Push advanced advancement toast alerts
  const triggerNotification = (title: string, desc: string, icon?: string) => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, title, description: desc, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // 1. Core authentication handler
  useEffect(() => {
    testConnection();

    if (isOfflineMode) {
      // Check local fallback session first
      const savedLocal = getLocalUser();
      if (savedLocal) {
        setCurrentUser(savedLocal);
        loadLocalState(savedLocal.uid, savedLocal.displayName);
      }
      setAuthChecking(false);
    } else {
      // Setup real Firebase Auth connection listener
      const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
        if (user) {
          setCurrentUser(user);
          // Sync with local session cached parameters
          setLocalUser({
            uid: user.uid,
            displayName: user.displayName || 'Steve',
            email: user.email || 'steve@minecraft.net',
            photoURL: user.photoURL || '🧑'
          });
          loadRealtimeListeners(user.uid, user.displayName || 'Steve', user.email || 'steve@minecraft.net');
        } else {
          // If offline mock session is present, fallback
          const savedLocal = getLocalUser();
          if (savedLocal) {
            setCurrentUser(savedLocal);
            loadLocalState(savedLocal.uid, savedLocal.displayName);
          } else {
            setCurrentUser(null);
          }
        }
        setAuthChecking(false);
      });
      return () => unsubscribe();
    }
  }, []);

  const loadRealtimeListeners = (uid: string, name: string, email: string) => {
    // 1. User Profile Realtime sync
    const unsubProfile = onSnapshot(doc(db, 'users', uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        const newProf: UserProfile = {
          uid,
          email,
          displayName: name,
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          streak: 1,
          lastActiveDate: new Date().toISOString().split('T')[0],
          inventory: ['golden_apple'],
          lifeAreas: ['Belajar', 'Kesehatan', 'Keuangan', 'Sosial'],
          createdAt: new Date().toISOString()
        };
        setProfile(newProf);
        syncUserProfile(uid, newProf);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    });

    // 2. Todos Realtime sync
    const unsubTodos = onSnapshot(collection(db, 'users', uid, 'todos'), (snap) => {
      const list: Todo[] = [];
      snap.forEach(d => list.push(d.data() as Todo));
      setTodos(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/todos`);
    });

    // 3. Habits Realtime sync
    const unsubHabits = onSnapshot(collection(db, 'users', uid, 'habits'), (snap) => {
      const list: Habit[] = [];
      snap.forEach(d => list.push(d.data() as Habit));
      setHabits(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/habits`);
    });

    // 4. Journals Realtime sync
    const unsubJournals = onSnapshot(collection(db, 'users', uid, 'journals'), (snap) => {
      const list: Journal[] = [];
      snap.forEach(d => list.push(d.data() as Journal));
      setJournals(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/journals`);
    });

    // 5. Roadmaps Realtime sync
    const unsubRoadmaps = onSnapshot(collection(db, 'users', uid, 'roadmaps'), (snap) => {
      const list: StudyRoadmap[] = [];
      snap.forEach(d => list.push(d.data() as any));
      setRoadmaps(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/roadmaps`);
    });

    // 6. Flashcards Realtime sync
    const unsubFlashcards = onSnapshot(collection(db, 'users', uid, 'flashcards'), (snap) => {
      const list: Flashcard[] = [];
      snap.forEach(d => list.push(d.data() as Flashcard));
      setFlashcards(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/flashcards`);
    });

    // 7. Health Tracker Realtime sync
    const todayStr = new Date().toISOString().split('T')[0];
    const unsubTracker = onSnapshot(doc(db, 'users', uid, 'trackers', `h_today_${todayStr}`), (docSnap) => {
      if (docSnap.exists()) {
        setHealthToday(docSnap.data() as HealthTracker);
      } else {
        const initHealth: HealthTracker = {
          id: `h_today_${todayStr}`,
          userId: uid,
          date: todayStr,
          waterMl: 0,
          sleepHours: 0,
          exerciseMinutes: 0,
          screenTimeMinutes: 0,
          eyeRestReminders: 0,
          createdAt: new Date().toISOString()
        };
        setHealthToday(initHealth);
        syncTracker(uid, initHealth);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/trackers/h_today_${todayStr}`);
    });

    setActiveListeners(prev => [
      ...prev,
      unsubProfile,
      unsubTodos,
      unsubHabits,
      unsubJournals,
      unsubRoadmaps,
      unsubFlashcards,
      unsubTracker
    ]);
  };

  useEffect(() => {
    return () => {
      activeListeners.forEach(unsub => unsub());
    };
  }, [activeListeners]);

  const handleLocalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gamerTag.trim()) return;
    playClickSound();

    const mockUid = "usr_" + Math.random().toString(36).substr(2, 9);
    const mockUser = {
      uid: mockUid,
      email: `${gamerTag.toLowerCase()}@minecraft.net`,
      displayName: gamerTag,
      photoURL: "🧑"
    };

    setLocalUser(mockUser);
    setCurrentUser(mockUser);
    loadLocalState(mockUid, gamerTag);
    triggerNotification(
      "Dunia Baru Dimulai!",
      `Halo ${gamerTag}! Selamat datang di petualangan barumu.`,
      "🧑"
    );
  };

  const handleSignOut = async () => {
    playClickSound();
    activeListeners.forEach(unsub => unsub());
    setActiveListeners([]);
    await signOutUser();
    // Reset defaults
    setTodos([]);
    setHabits([]);
    setJournals([]);
    setRoadmaps([]);
    setFlashcards([]);
  };

  // Local Storage loaders
  const loadLocalState = (uid: string, name: string) => {
    const localProfile = localStorage.getItem(`profile_${uid}`);
    if (localProfile) {
      setProfile(JSON.parse(localProfile));
    } else {
      // Create new initial profile
      const newProf: UserProfile = {
        uid,
        email: `${name.toLowerCase()}@minecraft.net`,
        displayName: name,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        streak: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        inventory: ['golden_apple'],
        lifeAreas: ['Belajar', 'Kesehatan', 'Keuangan', 'Sosial'],
        createdAt: new Date().toISOString()
      };
      setProfile(newProf);
      localStorage.setItem(`profile_${uid}`, JSON.stringify(newProf));
    }

    const localTodos = localStorage.getItem(`todos_${uid}`);
    if (localTodos) setTodos(JSON.parse(localTodos));
    
    const localHabits = localStorage.getItem(`habits_${uid}`);
    if (localHabits) setHabits(JSON.parse(localHabits));
    
    const localJournals = localStorage.getItem(`journals_${uid}`);
    if (localJournals) setJournals(JSON.parse(localJournals));
    
    const localRoadmaps = localStorage.getItem(`roadmaps_${uid}`);
    if (localRoadmaps) setRoadmaps(JSON.parse(localRoadmaps));
    
    const localFlashcards = localStorage.getItem(`flashcards_${uid}`);
    if (localFlashcards) setFlashcards(JSON.parse(localFlashcards));

    // Health tracker today initialization
    const todayStr = new Date().toISOString().split('T')[0];
    const localHealth = localStorage.getItem(`health_${uid}_${todayStr}`);
    if (localHealth) {
      setHealthToday(JSON.parse(localHealth));
    } else {
      const initHealth = {
        id: `h_${Date.now()}`,
        userId: uid,
        date: todayStr,
        waterMl: 0,
        sleepHours: 0,
        exerciseMinutes: 0,
        screenTimeMinutes: 0,
        eyeRestReminders: 0,
        createdAt: new Date().toISOString()
      };
      setHealthToday(initHealth);
      localStorage.setItem(`health_${uid}_${todayStr}`, JSON.stringify(initHealth));
    }
  };

  // Save changes helper to LocalStorage
  const saveLocalData = (key: string, data: any) => {
    if (currentUser) {
      localStorage.setItem(`${key}_${currentUser.uid}`, JSON.stringify(data));
    }
  };

  // Add / Deduct XP and level up check
  const gainXP = (amount: number) => {
    setProfile(prev => {
      let nextXp = prev.xp + amount;
      let nextLevel = prev.level;
      let hasLeveledUp = false;

      while (nextXp >= prev.xpToNextLevel) {
        nextXp -= prev.xpToNextLevel;
        nextLevel += 1;
        hasLeveledUp = true;
      }

      const updatedProfile = {
        ...prev,
        level: nextLevel,
        xp: nextXp,
        xpToNextLevel: nextLevel * 100 // Scale level requirement
      };
      
      if (currentUser) {
        localStorage.setItem(`profile_${currentUser.uid}`, JSON.stringify(updatedProfile));
      }

      if (hasLeveledUp) {
        setTimeout(() => {
          playXPChime();
          triggerNotification(
            "Level Up! ✨",
            `Naik tingkat ke Level ${nextLevel}! Kekuatanmu bertambah!`,
            "👑"
          );
        }, 100);
      }

      return updatedProfile;
    });
  };

  // Handlers
  const addTodo = (title: string, priority: Todo['priority'], difficulty: Todo['difficulty'], category: string, deadline?: string) => {
    const newTodo: Todo = {
      id: "td_" + Date.now(),
      userId: currentUser.uid,
      title,
      completed: false,
      priority,
      difficulty,
      category,
      subtasks: [],
      deadline,
      createdAt: new Date().toISOString()
    };
    
    const updated = [newTodo, ...todos];
    setTodos(updated);
    saveLocalData("todos", updated);
    gainXP(10); // +10 XP for writing chores

    if (!isOfflineMode) {
      syncTodo(currentUser.uid, newTodo);
    }
  };

  const toggleTodo = (id: string) => {
    const target = todos.find(t => t.id === id);
    if (!target) return;
    const nextCompleted = !target.completed;
    const updatedTodo = { ...target, completed: nextCompleted };

    if (nextCompleted) {
      const bonus = target.priority === "Netherite" ? 40 : target.priority === "Diamond" ? 25 : 15;
      gainXP(bonus);
    }

    const updated = todos.map(t => t.id === id ? updatedTodo : t);
    setTodos(updated);
    saveLocalData("todos", updated);

    if (!isOfflineMode) {
      syncTodo(currentUser.uid, updatedTodo);
    }
  };

  const deleteTodo = (id: string) => {
    const updated = todos.filter(t => t.id !== id);
    setTodos(updated);
    saveLocalData("todos", updated);

    if (!isOfflineMode) {
      removeTodo(currentUser.uid, id);
    }
  };

  const addSubtask = (todoId: string, title: string) => {
    const target = todos.find(t => t.id === todoId);
    if (!target) return;
    const sub = { id: "sub_" + Date.now(), title, completed: false };
    const updatedTodo = { ...target, subtasks: [...target.subtasks, sub] };

    const updated = todos.map(t => t.id === todoId ? updatedTodo : t);
    setTodos(updated);
    saveLocalData("todos", updated);

    if (!isOfflineMode) {
      syncTodo(currentUser.uid, updatedTodo);
    }
  };

  const toggleSubtask = (todoId: string, subtaskId: string) => {
    const target = todos.find(t => t.id === todoId);
    if (!target) return;

    const subs = target.subtasks.map(s => {
      if (s.id === subtaskId) {
        const nextCompleted = !s.completed;
        if (nextCompleted) gainXP(5); // Mini task XP reward
        return { ...s, completed: nextCompleted };
      }
      return s;
    });
    const updatedTodo = { ...target, subtasks: subs };

    const updated = todos.map(t => t.id === todoId ? updatedTodo : t);
    setTodos(updated);
    saveLocalData("todos", updated);

    if (!isOfflineMode) {
      syncTodo(currentUser.uid, updatedTodo);
    }
  };

  const updateSubtasks = (todoId: string, steps: { title: string; completed: boolean }[]) => {
    const target = todos.find(t => t.id === todoId);
    if (!target) return;
    const formatted = steps.map((s, idx) => ({ id: `step_${idx}_${Date.now()}`, title: s.title, completed: s.completed }));
    const updatedTodo = { ...target, subtasks: formatted };

    const updated = todos.map(t => t.id === todoId ? updatedTodo : t);
    setTodos(updated);
    saveLocalData("todos", updated);

    if (!isOfflineMode) {
      syncTodo(currentUser.uid, updatedTodo);
    }
  };

  const addHabit = (title: string, category: string) => {
    const newHabit: Habit = {
      id: "hb_" + Date.now(),
      userId: currentUser.uid,
      title,
      category,
      streak: 0,
      completedDates: [],
      createdAt: new Date().toISOString()
    };
    const updated = [newHabit, ...habits];
    setHabits(updated);
    saveLocalData("habits", updated);

    if (!isOfflineMode) {
      syncHabit(currentUser.uid, newHabit);
    }
  };

  const toggleHabitDate = (id: string, dateStr: string) => {
    const target = habits.find(h => h.id === id);
    if (!target) return;

    let dates = [...target.completedDates];
    let nextStreak = target.streak;
    
    if (dates.includes(dateStr)) {
      dates = dates.filter(d => d !== dateStr);
      nextStreak = Math.max(0, nextStreak - 1);
    } else {
      dates.push(dateStr);
      nextStreak += 1;
      gainXP(15); // habit consistency reward
    }
    const updatedHabit = { ...target, completedDates: dates, streak: nextStreak };

    const updated = habits.map(h => h.id === id ? updatedHabit : h);
    setHabits(updated);
    saveLocalData("habits", updated);

    if (!isOfflineMode) {
      syncHabit(currentUser.uid, updatedHabit);
    }
  };

  const deleteHabit = (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    saveLocalData("habits", updated);

    if (!isOfflineMode) {
      removeHabit(currentUser.uid, id);
    }
  };

  const addJournal = (content: string, mood: Journal['mood'], reflection: string) => {
    const newJournal: Journal = {
      id: "jr_" + Date.now(),
      userId: currentUser.uid,
      content,
      mood,
      reflection,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    const updated = [newJournal, ...journals];
    setJournals(updated);
    saveLocalData("journals", updated);
    gainXP(25); // +25 reflection bonus

    if (!isOfflineMode) {
      syncJournal(currentUser.uid, newJournal);
    }
  };

  const updateHealth = (updates: Partial<HealthTracker>) => {
    const updatedHealth = { ...healthToday, ...updates };
    setHealthToday(updatedHealth);

    if (currentUser) {
      localStorage.setItem(`health_${currentUser.uid}_${healthToday.date}`, JSON.stringify(updatedHealth));
    }
    
    // Complete minor water cups or screens task rewards XP directly
    if (updates.waterMl) gainXP(10);
    if (updates.sleepHours) gainXP(15);

    if (!isOfflineMode) {
      syncTracker(currentUser.uid, updatedHealth);
    }
  };

  const addRoadmap = (title: string, target: string, steps: string[]) => {
    const newRoad: StudyRoadmap = {
      id: "rm_" + Date.now(),
      userId: currentUser.uid,
      title,
      target,
      steps,
      createdAt: new Date().toISOString()
    };
    const updated = [newRoad, ...roadmaps];
    setRoadmaps(updated);
    saveLocalData("roadmaps", updated);

    if (!isOfflineMode) {
      syncRoadmap(currentUser.uid, newRoad);
    }
  };

  const deleteRoadmap = (id: string) => {
    const updated = roadmaps.filter(r => r.id !== id);
    setRoadmaps(updated);
    saveLocalData("roadmaps", updated);

    if (!isOfflineMode) {
      removeRoadmap(currentUser.uid, id);
    }
  };

  const addFlashcard = (deck: string, front: string, back: string) => {
    const newCard: Flashcard = {
      id: "fc_" + Date.now(),
      userId: currentUser.uid,
      deck,
      front,
      back,
      createdAt: new Date().toISOString()
    };
    const updated = [newCard, ...flashcards];
    setFlashcards(updated);
    saveLocalData("flashcards", updated);

    if (!isOfflineMode) {
      syncFlashcard(currentUser.uid, newCard);
    }
  };

  const deleteFlashcard = (id: string) => {
    const updated = flashcards.filter(c => c.id !== id);
    setFlashcards(updated);
    saveLocalData("flashcards", updated);

    if (!isOfflineMode) {
      removeFlashcard(currentUser.uid, id);
    }
  };

  const deductXPForShop = (cost: number, itemId: string) => {
    setProfile(prev => {
      const updated = {
        ...prev,
        xp: Math.max(0, prev.xp - cost),
        inventory: [...prev.inventory, itemId]
      };
      if (currentUser) {
        localStorage.setItem(`profile_${currentUser.uid}`, JSON.stringify(updated));
      }

      if (!isOfflineMode) {
        syncUserProfile(currentUser.uid, updated);
      }

      return updated;
    });
  };

  // 9 Slot Bottom Minecraft Hotbar Menu definition (Enables 100% beautiful responsive desktop/mobile toggle!)
  const hotbarMenu = [
    { title: "Dasbor", icon: "🏠", color: "hover:bg-green-700/60" },
    { title: "Quests", icon: "⚔️", color: "hover:bg-purple-700/60" },
    { title: "Habit", icon: "🛡️", color: "hover:bg-sky-700/60" },
    { title: "Fokus", icon: "⏱️", color: "hover:bg-red-700/60" },
    { title: "Kesehatan", icon: "🍎", color: "hover:bg-amber-700/60" },
    { title: "Belajar", icon: "📖", color: "hover:bg-emerald-700/60" },
    { title: "Buku", icon: "📝", color: "hover:bg-yellow-700/60" },
    { title: "Toko", icon: "🛒", color: "hover:bg-orange-700/60" },
    { title: "Coach", icon: "🧙", color: "hover:bg-indigo-700/60" }
  ];

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#14110e] flex flex-col items-center justify-center mc-font-pixel">
        <div className="text-stone-300 text-3xl animate-pulse">MENYIAPKAN BLOK TAMBANG...</div>
      </div>
    );
  }

  // LOGIN GATE IF NOT REGISTERED yet
  if (!currentUser) {
    return (
      <div className="min-h-screen mc-grid-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm mc-panel p-6 text-stone-800 flex flex-col gap-4 text-center">
          
          <div className="flex flex-col items-center gap-1.5 border-b-4 border-dashed border-stone-800/10 pb-3">
            <span className="text-4xl animate-bounce">⛰️</span>
            <h1 className="mc-font-pixel text-3xl font-extrabold tracking-wide uppercase leading-tight text-shadow">
              NETHERITE PRODUKTIF
            </h1>
            <p className="text-xs font-mono uppercase tracking-widest text-stone-600">Minecraft Gamified Planner</p>
          </div>

          <p className="text-sm font-sans text-stone-600 leading-relaxed">
            Dunia harian penuh tantangan produktif menantimu! Berikan namamu untuk mendirikan benteng petualang harian:
          </p>

          <form onSubmit={handleLocalLogin} className="flex flex-col gap-3 mt-1">
            <div className="flex flex-col items-start gap-1">
              <label className="mc-font-pixel text-xs text-stone-700">NAMA GUST / USERNAME CHAT:</label>
              <input 
                type="text" 
                maxLength={10}
                required
                className="w-full bg-stone-200 border-4 border-stone-400 p-2 text-stone-900 outline-none mc-font-pixel text-lg"
                placeholder="Steve, Alex, IjoBiru..."
                value={gamerTag}
                onChange={(e) => setGamerTag(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
              />
            </div>

            <button 
              type="submit" 
              className="mc-btn w-full py-2.5 text-xl"
            >
              🔨 BANGUN PETUALANGAN (+XP)
            </button>
          </form>

          {/* Settings note */}
          <div className="bg-stone-400 p-3 border-2 border-stone-500 font-mono text-[10px] text-stone-700 text-left mt-2">
            <span className="font-bold uppercase text-stone-900 block mb-0.5">ℹ️ PENYIMPANAN OFFLINE</span>
            Semua data aktivitas Anda disimpan aman secara Lokal di browser ini. Hubungkan Firebase untuk mengaktifkan sinkronisasi awan (cloud sync).
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mc-dark-bg pb-24 text-stone-200 selection:bg-yellow-700 select-none">
      
      {/* Toast Achievements alerts */}
      <AchievementToast toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* TOP HEADER STATUS HUB */}
      <XPBar 
        level={profile.level} 
        xp={profile.xp} 
        xpToNextLevel={profile.xpToNextLevel} 
        waterMl={healthToday.waterMl}
        sleepHours={healthToday.sleepHours}
        activeStreak={profile.streak}
      />

      {/* FLOATING SIGN-OUT MENU TOP RETAIL */}
      <div className="w-full max-w-5xl mx-auto px-4 pt-4 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <div className="text-xl">👩‍🌾</div>
          <span className="font-mono text-stone-400">Petualang: <b className="text-[#70cf41] font-bold font-sans text-sm">{profile.displayName}</b></span>
        </div>
        <button
          onClick={handleSignOut}
          className="p-1 px-3 bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 cursor-pointer font-mono text-[10px]"
        >
          KELUAR GAME (Sign Out)
        </button>
      </div>

      {/* MAIN LAYOUT CANVAS CONTAINER */}
      <main className="w-full max-w-5xl mx-auto px-4 py-3 flex flex-col gap-4">

        {/* SECTION DIRECTORY SELECTION BASE ON SLOTS BAR */}

        {/* SLOT 0: HOME DASHBOARD */}
        {activeSlot === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Quick dashboard overview */}
            <div className="flex flex-col gap-4">
              <PixelCard 
                title="⚙️ PAPAN KENDALI UTAMA" 
                subtitle="Selamat Pagi, Steve!"
                variant="light"
                icon="🧭"
              >
                <p className="text-sm leading-relaxed mb-4 text-stone-700 font-sans">
                  Mari pertahankan streak harianmu! Selesaikan Quests baju tempur Netherite, menambang air murni hidrasi, dan menyehatkan stamina bar harianmu.
                </p>

                {/* Eisenhower Matrix tips */}
                <div className="mc-panel-inner p-3 text-white text-xs">
                  <h5 className="mc-font-pixel text-yellow-400 mb-1">🔥 MISI HARI INI:</h5>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center font-mono">
                      <span>💀 Ender Quest (Sulit):</span>
                      <span className="text-red-400">Fokus utama!</span>
                    </div>
                    <div className="flex justify-between items-center font-mono">
                      <span>💦 target Air Minum:</span>
                      <span className="text-sky-300">Minimum 2 liter</span>
                    </div>
                  </div>
                </div>
              </PixelCard>

              {/* Character inventory status visual board */}
              <PixelCard title="📦 INVENTORY & BADGES" variant="dark" icon="🎒">
                <div className="flex flex-wrap gap-2 justify-center py-2">
                  {profile.inventory.length === 0 ? (
                    <p className="text-xs text-stone-500 font-mono italic">Inventory kosong. Kunjungi TOKO armor!</p>
                  ) : (
                    profile.inventory.map((item, idx) => (
                      <div key={idx} className="mc-slot w-10 h-10 flex items-center justify-center text-xl" title={item}>
                        {item === 'golden_apple' ? '🍎' : item === 'diamond_pickaxe' ? '⛏️' : item === 'diamond_sword' ? '⚔' : item === 'enchanted_book' ? '📖' : '🎂'}
                      </div>
                    ))
                  )}
                </div>
              </PixelCard>
            </div>

            {/* Quick analytics summary bar */}
            <PixelCard title="📊 STATS ANALYTICS BAR" variant="light" icon="📈">
              <AnalyticsPanel 
                healthTrackersHistory={[healthToday, ...healthHistory]} 
                todos={todos} 
                habits={habits} 
              />
            </PixelCard>

          </div>
        )}

        {/* SLOT 1: TO-DO (QUEST LISTS) */}
        {activeSlot === 1 && (
          <PixelCard title="⚔️ QUESTS CHECKLIST" subtitle="Smart Task Breakdown (AI)" variant="light" icon="🤺">
            <TodoList
              todos={todos}
              lifeAreas={profile.lifeAreas}
              onAddTodo={addTodo}
              onToggleTodo={toggleTodo}
              onDeleteTodo={deleteTodo}
              onAddSubtask={addSubtask}
              onToggleSubtask={toggleSubtask}
              onUpdateSubtasks={updateSubtasks}
              triggerNotification={triggerNotification}
            />
          </PixelCard>
        )}

        {/* SLOT 2: HABITS */}
        {activeSlot === 2 && (
          <PixelCard title="🛡️ HABIT TRACKING GRID" subtitle="Konsistensi Rutinitas" variant="light" icon="🏹">
            <HabitTracker
              habits={habits}
              lifeAreas={profile.lifeAreas}
              onAddHabit={addHabit}
              onToggleHabitDate={toggleHabitDate}
              onDeleteHabit={deleteHabit}
              triggerNotification={triggerNotification}
            />
          </PixelCard>
        )}

        {/* SLOT 3: DEEP TIMERS */}
        {activeSlot === 3 && (
          <PixelCard title="⏱️ CHRONOGRAPH FOCUS ENGINE" subtitle="Deep Study Mode" variant="light" icon="🕰️">
            <FocusPomodoro 
              onAddFocusMinutes={(mins) => gainXP(mins * 2)} // +2 XP per Focused min!
              triggerNotification={triggerNotification}
            />
          </PixelCard>
        )}

        {/* SLOT 4: HEALTHS INTAKES */}
        {activeSlot === 4 && (
          <PixelCard title="🍎 STAMINA & HP METERS" subtitle="Air, Tidur, dan Layar" variant="light" icon="🍞">
            <HealthTrackerPanel
              tracker={healthToday}
              onUpdateHealth={updateHealth}
              triggerNotification={triggerNotification}
            />
          </PixelCard>
        )}

        {/* SLOT 5: STUDY PLANNERS */}
        {activeSlot === 5 && (
          <PixelCard title="📖 STUDY CENTER BOARD" subtitle="Roadmaps & Flashcards" variant="light" icon="🏫">
            <StudyPlanner
              roadmaps={roadmaps}
              flashcards={flashcards}
              onAddRoadmap={addRoadmap}
              onAddFlashcard={addFlashcard}
              onDeleteFlashcard={deleteFlashcard}
              onDeleteRoadmap={deleteRoadmap}
              triggerNotification={triggerNotification}
            />
          </PixelCard>
        )}

        {/* SLOT 6: BUCHANAN REFLECTION & JOURNAL */}
        {activeSlot === 6 && (
          <PixelCard title="📝 BUKU CATATAN HARIAN" subtitle="Moods & Thoughts Diary" variant="light" icon="🕯️">
            <DailyReflector
              journals={journals}
              onAddJournal={addJournal}
              triggerNotification={triggerNotification}
            />
          </PixelCard>
        )}

        {/* SLOT 7: SHOP AMOR EQUIPMENT */}
        {activeSlot === 7 && (
          <PixelCard title="🛒 REWARD MERCHANDISER" subtitle="Emas & Berlian" variant="light" icon="💎">
            <Achievements
              userXP={profile.level * 100 + profile.xp} // Cumulative virtual currency calculation
              unlockedItems={profile.inventory}
              onDeductXP={deductXPForShop}
              triggerNotification={triggerNotification}
            />
          </PixelCard>
        )}

        {/* SLOT 8: STEVE AI COACH CHATS */}
        {activeSlot === 8 && (
          <PixelCard title="🧙 MINER-COACH COMPANION" subtitle="Consult Steve wizard instructions" variant="dark" icon="💡">
            <AICoach
              userXP={profile.xp}
              userLevel={profile.level}
              activeStreak={profile.streak}
              activeTopic="Tantangan Belajar"
            />
          </PixelCard>
        )}

      </main>

      {/* ========================================================== */}
      {/* 9-SLOT MINECRAFT HOTBAR MOBILE BOTTOM DOCK NAVIGATION */}
      {/* ========================================================== */}
      <footer className="fixed bottom-0 inset-x-0 bg-[#c6c6c6] border-t-4 border-[#373737] shadow-[inset_0_4px_0_#ffffff] p-2 flex justify-center z-40 select-none pb-safe">
        
        {/* Slot Grid frame */}
        <div className="flex bg-[#8b8b8b] border-4 border-[#373737] shadow-[inset_4px_4px_0_#555555] p-1 gap-1 w-full max-w-lg justify-between relative">
          
          {hotbarMenu.map((menu, idx) => {
            const isActive = activeSlot === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  playClickSound();
                  setActiveSlot(idx);
                }}
                className={`w-11 h-11 sm:w-12 sm:h-12 relative flex items-center justify-center text-2xl transition-all cursor-pointer rounded-none outline-none ${
                  isActive 
                    ? 'bg-[#3c8527] border-4 border-[#ffffff] shadow-[inset_-3px_-3px_0_#1e5210,inset_3px_3px_0_#70cf41]' 
                    : `bg-[#8b8b8b] border-2 border-transparent ${menu.color}`
                }`}
                title={menu.title}
              >
                {/* Icon rendering */}
                <span className="scale-100 active:scale-90 transition-transform">{menu.icon}</span>

                {/* Micro tooltip dots */}
                {isActive && (
                  <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#ffffff] block border border-[#000000] rotate-45"></span>
                )}
              </button>
            );
          })}

        </div>

      </footer>

    </div>
  );
}
