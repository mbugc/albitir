import type { PaymentResult } from '@/types';

export interface PaymentService {
  processPayment(amount: number, currency: string): Promise<PaymentResult>;
}

export class DummyPaymentService implements PaymentService {
  async processPayment(amount: number, _currency: string): Promise<PaymentResult> {
    await new Promise((r) => setTimeout(r, 800));
    console.log(`[PaymentService] Processing ₺${amount}`);
    return { success: true, transactionId: `dummy_${Date.now()}` };
  }
}

export const paymentService = new DummyPaymentService();
