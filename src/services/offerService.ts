import { db } from './firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import type { Offer, SortOption } from '@/types';

export async function getActiveOffers(sort: SortOption = 'relevance'): Promise<Offer[]> {
  let q = query(collection(db, 'offers'), where('isActive', '==', true));

  if (sort === 'price') {
    q = query(q, orderBy('priceDiscounted', 'asc'));
  } else if (sort === 'rating') {
    q = query(q, orderBy('rating', 'desc'));
  } else {
    q = query(q, orderBy('createdAt', 'desc'));
  }

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Offer));
}

export async function getOfferById(id: string): Promise<Offer | null> {
  const snap = await getDoc(doc(db, 'offers', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Offer;
}

export async function getBusinessOffers(businessId: string): Promise<Offer[]> {
  const q = query(
    collection(db, 'offers'),
    where('businessId', '==', businessId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Offer));
}

export async function createOffer(
  offer: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'offers'), {
    ...offer,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateOffer(
  id: string,
  data: Partial<Omit<Offer, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, 'offers', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
