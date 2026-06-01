import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut as fbSignOut, User, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

let app;
let db: any = null;
let auth: any = null;
let isOfflineMode = true;

// Validate if config is real or placeholder
const config = firebaseConfig as any;
if (config && !config.isPlaceholder && config.apiKey && config.apiKey !== "MOCK_KEY") {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
    isOfflineMode = false;
    console.log("Firebase initialized successfully. Cloud sync online.");
  } catch (error) {
    console.error("Firebase connection error. Falling back to offline client-state:", error);
    isOfflineMode = true;
  }
} else {
  console.log("Firebase is running in local-only sandbox mode. All records kept safe in LocalStorage.");
  isOfflineMode = true;
}

export { db, auth, isOfflineMode, onAuthStateChanged };

export async function signInWithGoogle() {
  if (isOfflineMode || !auth) {
    throw new Error("Cannot sign in with Google in offline mode.");
  }
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function signOutUser() {
  if (auth) {
    await fbSignOut(auth);
  }
  setLocalUser(null);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const authInstance = auth || getAuth();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance?.currentUser?.uid,
      email: authInstance?.currentUser?.email,
      emailVerified: authInstance?.currentUser?.emailVerified,
      isAnonymous: authInstance?.currentUser?.isAnonymous,
      tenantId: authInstance?.currentUser?.tenantId,
      providerInfo: authInstance?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Mock local auth provider for offline persistence
export interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

const LOCAL_USER_KEY = "mc_prod_local_user";

export function getLocalUser(): MockUser | null {
  const data = localStorage.getItem(LOCAL_USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function setLocalUser(user: MockUser | null) {
  if (user) {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_USER_KEY);
  }
}

