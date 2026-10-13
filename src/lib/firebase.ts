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
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { WeddingData, GuestRSVP, WeddingWish, GalleryItem } from '../types';
import { INITIAL_WEDDING_DATA } from '../data/defaultWeddingData';

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

// --- WEDDING DATA & ALBUM GALLERY SYNC ---
const WEDDING_DOC_ID = 'main';
const WEDDING_DOC_PATH = `wedding_data/${WEDDING_DOC_ID}`;

export function subscribeToWeddingData(
  onData: (data: WeddingData) => void,
  onError?: (error: Error) => void
) {
  let cachedMainData: WeddingData | null = null;
  let cachedGallery: GalleryItem[] | null = null;

  const emitMergedData = () => {
    if (!cachedMainData) return;
    const finalData: WeddingData = {
      ...INITIAL_WEDDING_DATA,
      ...cachedMainData,
      groom: {
        ...INITIAL_WEDDING_DATA.groom,
        ...(cachedMainData.groom || {}),
      },
      bride: {
        ...INITIAL_WEDDING_DATA.bride,
        ...(cachedMainData.bride || {}),
      },
      bankAccounts: {
        ...INITIAL_WEDDING_DATA.bankAccounts,
        ...(cachedMainData.bankAccounts || {}),
      },
      events:
        cachedMainData.events && cachedMainData.events.length > 0
          ? cachedMainData.events
          : INITIAL_WEDDING_DATA.events,
      story:
        cachedMainData.story && cachedMainData.story.length > 0
          ? cachedMainData.story
          : INITIAL_WEDDING_DATA.story,
      // If we have custom gallery items in wedding_gallery collection, use them
      gallery: (() => {
        let gal =
          cachedGallery && cachedGallery.length > 0
            ? cachedGallery
            : cachedMainData.gallery && cachedMainData.gallery.length > 0
            ? cachedMainData.gallery
            : INITIAL_WEDDING_DATA.gallery || [];
        // Make sure all gallery items have a valid non-empty url
        gal = gal.filter((p) => p && typeof p.url === 'string' && p.url.trim().length > 0);
        return gal.length > 0 ? gal : INITIAL_WEDDING_DATA.gallery;
      })(),
    };
    onData(finalData);
  };

  const weddingDocRef = doc(db, 'wedding_data', WEDDING_DOC_ID);
  const unsubMain = onSnapshot(
    weddingDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        try {
          const docData = snapshot.data();
          if (docData.weddingDataJson) {
            cachedMainData = JSON.parse(docData.weddingDataJson) as WeddingData;
            emitMergedData();
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

  const galleryCol = collection(db, 'wedding_gallery');
  const galleryQuery = query(galleryCol, orderBy('order', 'asc'));
  const unsubGallery = onSnapshot(
    galleryQuery,
    (snapshot) => {
      const items: GalleryItem[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        if (item.url) {
          items.push({
            id: docSnap.id,
            url: item.url,
            title: item.title || '',
            caption: item.caption || undefined,
          });
        }
      });
      cachedGallery = items;
      emitMergedData();
    },
    (error) => {
      console.warn('Gallery collection sync notice:', error);
    }
  );

  return () => {
    unsubMain();
    unsubGallery();
  };
}

export async function saveWeddingDataToFirestore(data: WeddingData): Promise<void> {
  try {
    const weddingDocRef = doc(db, 'wedding_data', WEDDING_DOC_ID);

    // 1. Sync all gallery photos into wedding_gallery collection
    if (data.gallery && data.gallery.length > 0) {
      // Save each photo as its own document in wedding_gallery
      const saveGalleryPromises = data.gallery.map((photo, index) => {
        const safePhotoId = (photo.id || `album_${Date.now()}_${index}`).replace(/[^a-zA-Z0-9_-]/g, '_');
        const photoRef = doc(db, 'wedding_gallery', safePhotoId);
        return setDoc(photoRef, {
          url: photo.url,
          title: photo.title || '',
          caption: photo.caption || '',
          order: index,
          updatedAt: new Date().toISOString(),
        });
      });

      await Promise.all(saveGalleryPromises);

      // Clean up any deleted photos from wedding_gallery
      try {
        const currentGalleryDocs = await getDocs(collection(db, 'wedding_gallery'));
        const activeIds = new Set(data.gallery.map((p) => (p.id || '').replace(/[^a-zA-Z0-9_-]/g, '_')));
        const deletePromises: Promise<void>[] = [];
        currentGalleryDocs.forEach((docSnap) => {
          if (!activeIds.has(docSnap.id)) {
            deletePromises.push(deleteDoc(docSnap.ref));
          }
        });
        if (deletePromises.length > 0) {
          await Promise.all(deletePromises);
        }
      } catch (cleanErr) {
        console.warn('Could not clean old gallery photos:', cleanErr);
      }
    } else {
      // If gallery is explicitly emptied, remove all docs in wedding_gallery
      try {
        const currentGalleryDocs = await getDocs(collection(db, 'wedding_gallery'));
        const deletePromises: Promise<void>[] = [];
        currentGalleryDocs.forEach((docSnap) => {
          deletePromises.push(deleteDoc(docSnap.ref));
        });
        if (deletePromises.length > 0) {
          await Promise.all(deletePromises);
        }
      } catch (cleanErr) {
        console.warn('Could not clear empty gallery:', cleanErr);
      }
    }

    // 2. Save wedding_data/main document
    // If the full data fits under 500KB, keep it all in wedding_data/main.
    // If oversized due to images, save lightweight gallery references in main document.
    let dataToSaveInMain = { ...data };
    const jsonString = JSON.stringify(data);
    if (jsonString.length > 500 * 1024) {
      dataToSaveInMain = {
        ...data,
        gallery: data.gallery.map((p) => ({
          id: p.id,
          url: p.url.startsWith('data:') ? '' : p.url,
          title: p.title,
          caption: p.caption,
        })),
      };
    }

    await setDoc(weddingDocRef, {
      weddingDataJson: JSON.stringify(dataToSaveInMain),
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
