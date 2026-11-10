import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  runTransaction,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { RoomData, PoemLine, PlayerRole } from '../types';

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
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const currentAuth = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: currentAuth?.uid ?? null,
      email: currentAuth?.email ?? null,
      emailVerified: currentAuth?.emailVerified ?? null,
      isAnonymous: currentAuth?.isAnonymous ?? null,
    },
  };
  console.warn('Firestore notice:', JSON.stringify(errInfo));
}

const resolvedConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
};

const app = !getApps().length ? initializeApp(resolvedConfig) : getApp();
export const db = getFirestore(app, resolvedConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Attempt silent authentication, but NEVER block execution if disabled in console
export async function ensureAuth(): Promise<User | null> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    // If anonymous auth is disabled in the project console, continue gracefully
    console.info('Proceeding with room key access (anonymous auth optional):', err);
    return null;
  }
}

// Background auth attempt on boot
ensureAuth().catch(() => {});

export async function getRoom(roomId: string): Promise<RoomData | null> {
  const roomPath = `rooms/${roomId}`;
  try {
    const snap = await getDoc(doc(db, 'rooms', roomId));
    if (snap.exists()) {
      const data = snap.data() as RoomData;
      // Backup to localStorage
      try {
        localStorage.setItem(`poemplay_cache_${roomId}`, JSON.stringify(data));
      } catch {
        // ignore
      }
      return data;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, roomPath);
  }

  // Local storage fallback
  try {
    const cached = localStorage.getItem(`poemplay_cache_${roomId}`);
    if (cached) {
      return JSON.parse(cached) as RoomData;
    }
  } catch {
    // ignore
  }

  return null;
}

export async function saveRoom(room: RoomData): Promise<void> {
  const roomPath = `rooms/${room.id}`;

  // Instant local backup
  try {
    localStorage.setItem(`poemplay_cache_${room.id}`, JSON.stringify(room));
  } catch {
    // ignore
  }

  try {
    await setDoc(doc(db, 'rooms', room.id), room, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, roomPath);
  }
}

/**
 * Atomic line addition using Firestore transaction.
 * Guarantees that neither player's lines are ever lost or overwritten when concurrent writes occur.
 */
export async function addLineToRoom(
  roomId: string,
  newLine: PoemLine,
  nextTurn: PlayerRole
): Promise<RoomData | null> {
  const roomPath = `rooms/${roomId}`;
  const roomRef = doc(db, 'rooms', roomId);

  try {
    const updated = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(roomRef);
      if (!snap.exists()) {
        throw new Error(`Room ${roomId} does not exist`);
      }
      const data = snap.data() as RoomData;
      const currentLines = data.lines || [];

      // Deduplicate: If already present, don't append again; otherwise append
      const alreadyHasLine = currentLines.some((l) => l.id === newLine.id);
      const newLinesList = alreadyHasLine
        ? currentLines.map((l) => (l.id === newLine.id ? newLine : l))
        : [...currentLines, newLine];

      transaction.update(roomRef, {
        lines: newLinesList,
        turn: nextTurn,
        updatedAt: Date.now(),
      });

      const resultRoom: RoomData = {
        ...data,
        lines: newLinesList,
        turn: nextTurn,
        updatedAt: Date.now(),
      };

      return resultRoom;
    });

    try {
      localStorage.setItem(`poemplay_cache_${roomId}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    return updated;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, roomPath);
    return null;
  }
}

/**
 * Partial field updater using updateDoc.
 * Modifies ONLY the provided fields (e.g. messages, player profile, title)
 * without touching or overwriting the lines array!
 */
export async function updateRoomFields(
  roomId: string,
  fields: Record<string, unknown>
): Promise<void> {
  const roomPath = `rooms/${roomId}`;
  const roomRef = doc(db, 'rooms', roomId);

  try {
    await updateDoc(roomRef, {
      ...fields,
      updatedAt: Date.now(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, roomPath);
  }
}

export function subscribeToRoom(
  roomId: string,
  onUpdate: (room: RoomData | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const roomPath = `rooms/${roomId}`;
  let unsubFirestore: Unsubscribe = () => {};

  try {
    unsubFirestore = onSnapshot(
      doc(db, 'rooms', roomId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as RoomData;
          try {
            localStorage.setItem(`poemplay_cache_${roomId}`, JSON.stringify(data));
          } catch {
            // ignore
          }
          onUpdate(data);
        } else {
          // Check local cache
          try {
            const cached = localStorage.getItem(`poemplay_cache_${roomId}`);
            if (cached) {
              onUpdate(JSON.parse(cached) as RoomData);
              return;
            }
          } catch {
            // ignore
          }
          onUpdate(null);
        }
      },
      (err) => {
        console.warn('Real-time snapshot notice:', err);
        handleFirestoreError(err, OperationType.GET, roomPath);
        if (onError) onError(err);

        // Fallback: poll local cache if Firestore is offline
        try {
          const cached = localStorage.getItem(`poemplay_cache_${roomId}`);
          if (cached) {
            onUpdate(JSON.parse(cached) as RoomData);
          }
        } catch {
          // ignore
        }
      }
    );
  } catch (err) {
    console.warn('Snapshot listener init error:', err);
  }

  return () => {
    unsubFirestore();
  };
}
