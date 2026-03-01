import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import type { Business, BusinessStatus } from '@/types';

interface CreateBusinessParams {
  ownerId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  category: Business['category'];
  surplusCategory: Business['surplusCategory'];
  address: Business['address'];
  iban?: string;
}

export async function createBusiness(params: CreateBusinessParams): Promise<string> {
  const ref = await addDoc(collection(db, 'businesses'), {
    ...params,
    geo: { latitude: 0, longitude: 0 },
    documents: [],
    iban: params.iban ?? '',
    status: 'PENDING_REVIEW' as BusinessStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBusinessStatus(
  businessId: string,
  status: BusinessStatus,
  reviewNotes?: string,
): Promise<void> {
  const ref = doc(db, 'businesses', businessId);
  await updateDoc(ref, {
    status,
    ...(reviewNotes !== undefined ? { reviewNotes } : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function getBusinessByOwner(ownerId: string): Promise<Business | null> {
  const q = query(collection(db, 'businesses'), where('ownerId', '==', ownerId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Business;
}

export async function getBusiness(id: string): Promise<Business | null> {
  const snap = await getDoc(doc(db, 'businesses', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Business;
}
