import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  addDoc,
  serverTimestamp,
  increment,
  orderBy,
} from 'firebase/firestore';
import type { WalletTransaction } from '@/types';
import { SIGNUP_BONUS_AMOUNT } from '@/types';

export async function grantSignupBonus(userId: string): Promise<boolean> {
  // Check if bonus already granted (query wallet transactions for signup_bonus type)
  const q = query(
    collection(db, 'walletTransactions'),
    where('userId', '==', userId),
    where('type', '==', 'signup_bonus'),
  );
  const snap = await getDocs(q);
  if (!snap.empty) return false; // Already granted

  // Create transaction record
  await addDoc(collection(db, 'walletTransactions'), {
    userId,
    type: 'signup_bonus',
    amount: SIGNUP_BONUS_AMOUNT,
    description: 'Hoş geldin bonusu',
    createdAt: serverTimestamp(),
  });

  // Update user's wallet balance
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    walletBalance: increment(SIGNUP_BONUS_AMOUNT),
    updatedAt: serverTimestamp(),
  });

  return true;
}

export async function getWalletBalance(userId: string): Promise<number> {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return 0;
  return (snap.data().walletBalance as number) ?? 0;
}

export async function applyCredit(userId: string, orderId: string, amount: number): Promise<void> {
  // Create debit transaction
  await addDoc(collection(db, 'walletTransactions'), {
    userId,
    type: 'credit_used',
    amount: -amount,
    orderId,
    description: 'Sipariş indirimi',
    createdAt: serverTimestamp(),
  });

  // Decrement user balance
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    walletBalance: increment(-amount),
    updatedAt: serverTimestamp(),
  });
}

export async function getWalletTransactions(userId: string): Promise<WalletTransaction[]> {
  const q = query(
    collection(db, 'walletTransactions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as WalletTransaction);
}
