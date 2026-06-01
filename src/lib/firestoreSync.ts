import { 
  doc, setDoc, deleteDoc, getDoc, getDocFromServer, collection, query, where, onSnapshot 
} from 'firebase/firestore';
import { db, isOfflineMode, handleFirestoreError, OperationType } from './firebase';
import { UserProfile, Todo, Habit, Goal, Journal, HealthTracker, StudyRoadmap, Flashcard } from '../types';

export async function testConnection() {
  if (isOfflineMode || !db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection test passed.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Server is reporting offline.");
    }
  }
}

// User Profile Sync
export async function syncUserProfile(uid: string, profile: UserProfile) {
  if (isOfflineMode || !db) return;
  const path = `users/${uid}`;
  try {
    await setDoc(doc(db, 'users', uid), profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Todos Sync
export async function syncTodo(uid: string, todo: Todo) {
  if (isOfflineMode || !db) return;
  const path = `users/${uid}/todos/${todo.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'todos', todo.id), todo);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeTodo(uid: string, todoId: string) {
  if (isOfflineMode || !db) return;
  const path = `users/${uid}/todos/${todoId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'todos', todoId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Habits Sync
export async function syncHabit(uid: string, habit: Habit) {
  if (isOfflineMode || !db) return;
  const path = `users/${uid}/habits/${habit.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'habits', habit.id), habit);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeHabit(uid: string, habitId: string) {
  if (isOfflineMode || !db) return;
  const path = `users/${uid}/habits/${habitId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'habits', habitId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Goals Sync
export async function syncGoal(uid: string, goal: Goal) {
  if (isOfflineMode || !db) return;
  const path = `users/${uid}/goals/${goal.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'goals', goal.id), goal);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Journals Sync
export async function syncJournal(uid: string, journal: Journal) {
  if (isOfflineMode || !db) return;
  const path = `users/${uid}/journals/${journal.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'journals', journal.id), journal);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Trackers Sync
export async function syncTracker(uid: string, tracker: HealthTracker) {
  if (isOfflineMode || !db) return;
  const path = `users/${uid}/trackers/${tracker.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'trackers', tracker.id), tracker);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Roadmaps Sync
export async function syncRoadmap(uid: string, roadmap: StudyRoadmap) {
  if (isOfflineMode || !db) return;
  const path = `users/${uid}/roadmaps/${roadmap.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'roadmaps', roadmap.id), roadmap);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeRoadmap(uid: string, roadmapId: string) {
  if (isOfflineMode || !db) return;
  const path = `users/${uid}/roadmaps/${roadmapId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'roadmaps', roadmapId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Flashcards Sync
export async function syncFlashcard(uid: string, flashcard: Flashcard) {
  if (isOfflineMode || !db) return;
  const path = `users/${uid}/flashcards/${flashcard.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'flashcards', flashcard.id), flashcard);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeFlashcard(uid: string, cardId: string) {
  if (isOfflineMode || !db) return;
  const path = `users/${uid}/flashcards/${cardId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'flashcards', cardId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
