import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  getCountFromServer,
} from 'firebase/firestore';
import { updateBusinessStatus } from './businessService';
import type { Business, BusinessStatus, Order } from '@/types';

export async function isAdmin(userId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'admins', userId));
  return snap.exists();
}

export async function getPendingBusinesses(): Promise<Business[]> {
  const q = query(
    collection(db, 'businesses'),
    where('status', 'in', ['PENDING_REVIEW', 'IN_REVIEW', 'NEEDS_INFO']),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Business);
}

export async function getAllBusinesses(): Promise<Business[]> {
  const q = query(collection(db, 'businesses'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Business);
}

export { updateBusinessStatus };

export async function getRecentOrders(limit = 20): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.slice(0, limit).map((d) => ({ id: d.id, ...d.data() }) as Order);
}

export interface AdminStats {
  totalOrders: number;
  totalMerchants: number;
  approvedMerchants: number;
  pendingMerchants: number;
  totalConsumers: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [ordersSnap, merchantsSnap, consumersSnap] = await Promise.all([
    getCountFromServer(collection(db, 'orders')),
    getDocs(collection(db, 'businesses')),
    getCountFromServer(collection(db, 'users')),
  ]);

  const merchants = merchantsSnap.docs.map((d) => d.data() as { status: BusinessStatus });

  return {
    totalOrders: ordersSnap.data().count,
    totalMerchants: merchants.length,
    approvedMerchants: merchants.filter((m) => m.status === 'APPROVED').length,
    pendingMerchants: merchants.filter((m) => m.status !== 'APPROVED' && m.status !== 'REJECTED').length,
    totalConsumers: consumersSnap.data().count,
  };
}
