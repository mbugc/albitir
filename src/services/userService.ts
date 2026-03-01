import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import type { User, UserLocation } from '@/types';

export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as User;
}

export async function createUser(
  uid: string,
  data: Pick<User, 'email' | 'name' | 'country'>,
): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    role: 'consumer',
    favouriteOfferIds: [],
    walletBalance: 0,
    location: {
      city: 'Istanbul',
      latitude: 41.0082,
      longitude: 28.9784,
      radiusKm: 10,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUser(
  uid: string,
  data: Partial<Omit<User, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserLocation(uid: string, location: UserLocation): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    location,
    updatedAt: serverTimestamp(),
  });
}

export async function addFavourite(uid: string, offerId: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    favouriteOfferIds: arrayUnion(offerId),
    updatedAt: serverTimestamp(),
  });
}

export async function removeFavourite(uid: string, offerId: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    favouriteOfferIds: arrayRemove(offerId),
    updatedAt: serverTimestamp(),
  });
}
