export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  lastActiveDate: string;
  inventory: string[]; // unlocked rewards e.g., ["diamond_sword", "golden_apple"]
  lifeAreas: string[]; // e.g. ["Belajar", "Kesehatan", "Finansial", "Sosial"]
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  priority: "Netherite" | "Diamond" | "Iron" | "Wooden"; // High, Medium, Low, Very Low
  category: string; // life area
  isSubtaskOf?: string;
  subtasks: Subtask[];
  deadline?: string;
  difficulty: "Ender" | "Nether" | "Normal"; // Hard, Medium, Easy
  createdAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  category: string; // life area
  streak: number;
  completedDates: string[]; // YYYY-MM-DD strings
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  type: "daily" | "weekly" | "monthly";
  completed: boolean;
  createdAt: string;
}

export interface Journal {
  id: string;
  userId: string;
  content: string;
  mood: "Steve (Excited)" | "Creeper (Stressed)" | "Enderman (Focused)" | "Slime (Lazy)" | "Villager (Happy)";
  reflection: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface HealthTracker {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  waterMl: number; // e.g. up to 3000
  sleepHours: number; // e.g. up to 12
  exerciseMinutes: number; // e.g. up to 180
  screenTimeMinutes: number; // e.g. up to 999
  eyeRestReminders: number; // count
  createdAt: string;
}

export interface StudyRoadmap {
  id: string;
  userId: string;
  title: string;
  target: string;
  steps: string[];
  createdAt: string;
}

export interface Flashcard {
  id: string;
  userId: string;
  deck: string;
  front: string;
  back: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string; // e.g., logo code or emoji
}
