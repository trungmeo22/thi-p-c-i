import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { WeddingData, GuestRSVP, WeddingWish } from '../types';

// Initialize Firebase SDK
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// SKILL SPECIFICATION: OperationType and FirestoreErrorInfo
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
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check to Firestore server
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Notice: Firebase client appears offline.');
      return false;
    }
    // Return true even if permission denied on test doc, since connection reached server
    return true;
  }
}

// Run test connection
testConnection().catch(() => {});

// --- WEDDING DATA SYNC ---
const WEDDING_DOC_ID = 'main';
const WEDDING_DOC_PATH = `wedding_data/${WEDDING_DOC_ID}`;

export function subscribeToWeddingData(
  onData: (data: WeddingData) => void,
  onError?: (error: Error) => void
) {
  const weddingDocRef = doc(db, 'wedding_data', WEDDING_DOC_ID);
  return onSnapshot(
    weddingDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        try {
          const docData = snapshot.data();
          if (docData.weddingDataJson) {
            const parsed = JSON.parse(docData.weddingDataJson) as WeddingData;
            onData(parsed);
          }
        } catch (err) {
          console.error('Failed to parse wedding data from Firestore:', err);
        }
      }
    },
    (error) => {
      if (onError) {
        onError(error);
      }
      handleFirestoreError(error, OperationType.GET, WEDDING_DOC_PATH);
    }
  );
}

export async function saveWeddingDataToFirestore(data: WeddingData): Promise<void> {
  try {
    const weddingDocRef = doc(db, 'wedding_data', WEDDING_DOC_ID);
    await setDoc(weddingDocRef, {
      weddingDataJson: JSON.stringify(data),
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.email || 'admin',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, WEDDING_DOC_PATH);
  }
}

// --- GUEST RSVPS SYNC ---
export function subscribeToGuests(
  onGuests: (guests: GuestRSVP[]) => void,
  onError?: (error: Error) => void
) {
  const guestsCol = collection(db, 'rsvps');
  const q = query(guestsCol, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const guestList: GuestRSVP[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        guestList.push({
          id: docSnap.id,
          name: item.name || '',
          phone: item.phone || '',
          email: item.email || '',
          guestSide: item.guestSide || 'groom',
          attendance: item.attendance || 'attending',
          guestCount: Number(item.guestCount ?? 1),
          needTransportation: Boolean(item.needTransportation),
          notes: item.notes || '',
          createdAt: item.createdAt || new Date().toISOString(),
        });
      });
      onGuests(guestList);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'rsvps');
    }
  );
}

export async function addGuestToFirestore(guest: GuestRSVP): Promise<void> {
  const safeId = guest.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `rsvps/${safeId}`;
  try {
    const rsvpRef = doc(db, 'rsvps', safeId);
    await setDoc(rsvpRef, {
      name: guest.name.slice(0, 100),
      phone: (guest.phone || '').slice(0, 30),
      guestSide: guest.guestSide,
      attendance: guest.attendance,
      guestCount: Math.min(Math.max(1, guest.guestCount || 1), 20),
      needTransportation: Boolean(guest.needTransportation),
      notes: (guest.notes || '').slice(0, 500),
      createdAt: guest.createdAt || new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteGuestFromFirestore(guestId: string): Promise<void> {
  const safeId = guestId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `rsvps/${safeId}`;
  try {
    await deleteDoc(doc(db, 'rsvps', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateGuestStatusInFirestore(
  guestId: string,
  status: 'attending' | 'tentative' | 'not_attending'
): Promise<void> {
  const safeId = guestId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `rsvps/${safeId}`;
  try {
    await updateDoc(doc(db, 'rsvps', safeId), {
      attendance: status,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// --- WEDDING WISHES SYNC ---
export function subscribeToWishes(
  onWishes: (wishes: WeddingWish[]) => void,
  onError?: (error: Error) => void
) {
  const wishesCol = collection(db, 'wishes');
  const q = query(wishesCol, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const wishesList: WeddingWish[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        wishesList.push({
          id: docSnap.id,
          senderName: item.senderName || '',
          relationship: item.relationship || 'Bạn bè',
          message: item.message || '',
          createdAt: item.createdAt || new Date().toISOString(),
          likes: Number(item.likes ?? 0),
        });
      });
      onWishes(wishesList);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'wishes');
    }
  );
}

export async function addWishToFirestore(wish: WeddingWish): Promise<void> {
  const safeId = wish.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `wishes/${safeId}`;
  try {
    const wishRef = doc(db, 'wishes', safeId);
    await setDoc(wishRef, {
      senderName: wish.senderName.slice(0, 100),
      relationship: (wish.relationship || 'Bạn bè').slice(0, 50),
      message: wish.message.slice(0, 1000),
      createdAt: wish.createdAt || new Date().toISOString(),
      likes: wish.likes || 0,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function likeWishInFirestore(wishId: string, currentLikes: number): Promise<void> {
  const safeId = wishId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `wishes/${safeId}`;
  try {
    const wishRef = doc(db, 'wishes', safeId);
    await updateDoc(wishRef, {
      likes: currentLikes + 1,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
