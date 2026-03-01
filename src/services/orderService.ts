import { db } from './firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import type { Order, OrderStatus, OrderRating } from '@/types';
import { COMMISSION_RATE, TAX_RATE } from '@/types';
import { generatePickupCode, generateOrderNumber } from '@/utils/generatePickupCode';
import { getNextPickupDate } from '@/utils/formatDate';

// ─── Create Order ───────────────────────────────────────────────────

interface CreateOrderParams {
  userId: string;
  offerId: string;
  businessId: string;
  offerTitle: string;
  businessName: string;
  businessAddress: string;
  quantity: number;
  pricePerUnit: number;
  pickupStart: string;
  pickupEnd: string;
  daysOfWeek: number[];
  pickupNote?: string;
  creditApplied?: number; // kuruş cinsinden
}

export async function createOrder(params: CreateOrderParams): Promise<Order> {
  const offerRef = doc(db, 'offers', params.offerId);
  const orderRef = doc(collection(db, 'orders'));

  const subtotal = parseFloat((params.pricePerUnit * params.quantity).toFixed(2));
  const commission = parseFloat((subtotal * COMMISSION_RATE).toFixed(2));
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const creditApplied = params.creditApplied ?? 0;
  const total = parseFloat(Math.max(0, subtotal + tax - creditApplied / 100).toFixed(2));
  const pickupCode = generatePickupCode();
  const orderNumber = generateOrderNumber();
  const pickupDate = getNextPickupDate(params.daysOfWeek);

  await runTransaction(db, async (tx) => {
    const offerSnap = await tx.get(offerRef);
    if (!offerSnap.exists()) throw new Error('Teklif bulunamadı');

    const available = offerSnap.data().quantityAvailable as number;
    if (available < params.quantity) throw new Error('Yeterli stok yok');

    tx.update(offerRef, { quantityAvailable: available - params.quantity });
    tx.set(orderRef, {
      orderNumber,
      userId: params.userId,
      offerId: params.offerId,
      businessId: params.businessId,
      offerTitle: params.offerTitle,
      businessName: params.businessName,
      businessAddress: params.businessAddress,
      quantity: params.quantity,
      pricePerUnit: params.pricePerUnit,
      subtotal,
      commission,
      commissionRate: COMMISSION_RATE,
      tax,
      creditApplied,
      total,
      pickupCode,
      pickupNote: params.pickupNote ?? '',
      pickupDate,
      pickupStart: params.pickupStart,
      pickupEnd: params.pickupEnd,
      status: 'PAID' as OrderStatus, // dummy payment → directly PAID
      paymentStatus: 'PLACEHOLDER',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  return {
    id: orderRef.id,
    orderNumber,
    userId: params.userId,
    offerId: params.offerId,
    businessId: params.businessId,
    offerTitle: params.offerTitle,
    businessName: params.businessName,
    businessAddress: params.businessAddress,
    quantity: params.quantity,
    pricePerUnit: params.pricePerUnit,
    subtotal,
    commission,
    commissionRate: COMMISSION_RATE,
    tax,
    creditApplied,
    total,
    pickupCode,
    pickupNote: params.pickupNote,
    pickupDate,
    pickupStart: params.pickupStart,
    pickupEnd: params.pickupEnd,
    status: 'PAID',
    paymentStatus: 'PLACEHOLDER',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdAt: null as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updatedAt: null as any,
  };
}

// ─── Query Orders ───────────────────────────────────────────────────

export async function getMyOrders(userId: string): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
}

export async function getBusinessOrders(businessId: string): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('businessId', '==', businessId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, 'orders', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

// ─── Update Order Status ────────────────────────────────────────────

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CREATED: ['PAID'],
  PAID: ['READY', 'NO_SHOW'],
  READY: ['COMPLETED', 'NO_SHOW'],
  COMPLETED: [],
  NO_SHOW: [],
};

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  const snap = await getDoc(orderRef);
  if (!snap.exists()) throw new Error('Sipariş bulunamadı');

  const currentStatus = snap.data().status as OrderStatus;
  if (!VALID_TRANSITIONS[currentStatus].includes(newStatus)) {
    throw new Error(`Geçersiz durum geçişi: ${currentStatus} → ${newStatus}`);
  }

  await updateDoc(orderRef, {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });
}

// ─── Pickup Code Verification ───────────────────────────────────────

export async function verifyPickupCode(
  orderId: string,
  code: string,
): Promise<boolean> {
  const snap = await getDoc(doc(db, 'orders', orderId));
  if (!snap.exists()) return false;
  return snap.data().pickupCode === code;
}

// ─── Rating ─────────────────────────────────────────────────────────

export async function rateOrder(
  orderId: string,
  stars: number,
  comment?: string,
): Promise<void> {
  const rating: Omit<OrderRating, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    stars,
    comment,
    createdAt: serverTimestamp(),
  };

  await updateDoc(doc(db, 'orders', orderId), {
    rating,
    updatedAt: serverTimestamp(),
  });
}
