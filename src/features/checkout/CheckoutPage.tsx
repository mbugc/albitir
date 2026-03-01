import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { createOrder } from '@/services/orderService';
import { DummyPaymentService } from '@/services/paymentService';
import { getWalletBalance, applyCredit } from '@/services/walletService';
import { TAX_RATE } from '@/types';
import type { Offer } from '@/types';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import { formatCurrency } from '@/utils/formatCurrency';
import { getNextPickupDate, getPickupDateLabel } from '@/utils/formatDate';

interface CheckoutState {
  offer: Offer;
  quantity: number;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, setUserProfile } = useAuth();

  const state = location.state as CheckoutState | null;

  const [pickupNote, setPickupNote] = useState('');
  const [useCredit, setUseCredit] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userProfile) return;
    getWalletBalance(userProfile.id).then(setWalletBalance);
  }, [userProfile]);

  if (!state || !state.offer || !state.quantity) {
    return (
      <div className="flex min-h-dvh flex-col bg-white">
        <PageHeader title="Ödeme" showBack />
        <div className="flex flex-1 items-center justify-center p-4 text-center">
          <div>
            <p className="text-slate-500">Sipariş bilgisi bulunamadı.</p>
            <button onClick={() => navigate('/discover')} className="mt-4 font-semibold text-primary-700">
              Keşfete dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { offer, quantity } = state;
  const pickupDate = getNextPickupDate(offer.daysOfWeek);
  const dateLabel = getPickupDateLabel(pickupDate);

  const subtotal = offer.priceDiscounted * quantity;
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const serviceFee = 0; // Free for MVP
  const maxCredit = Math.min(walletBalance, Math.round((subtotal + tax) * 100)); // kuruş
  const creditApplied = useCredit ? maxCredit : 0;
  const total = Math.max(0, subtotal + tax + serviceFee - creditApplied / 100);

  const handleCheckout = async () => {
    if (!userProfile) return;
    setLoading(true);
    setError('');

    try {
      // Dummy payment
      const paymentService = new DummyPaymentService();
      await paymentService.processPayment(total, offer.currency);

      // Create order
      const order = await createOrder({
        userId: userProfile.id,
        offerId: offer.id,
        businessId: offer.businessId,
        offerTitle: offer.title,
        businessName: offer.businessName,
        businessAddress: offer.address,
        quantity,
        pricePerUnit: offer.priceDiscounted,
        pickupStart: offer.pickupStart,
        pickupEnd: offer.pickupEnd,
        daysOfWeek: offer.daysOfWeek,
        pickupNote: pickupNote.trim() || undefined,
        creditApplied,
      });

      // Apply wallet credit if used
      if (creditApplied > 0) {
        await applyCredit(userProfile.id, order.id, creditApplied);
        // Update local profile wallet balance
        setUserProfile({
          ...userProfile,
          walletBalance: userProfile.walletBalance - creditApplied,
        });
      }

      navigate(`/orders/${order.id}/confirmed`, {
        state: { order },
        replace: true,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <PageHeader title="Ödeme" showBack />

      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-4">
        {/* Order summary */}
        <section className="rounded-xl border border-slate-100 p-4">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Sipariş özeti</h2>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-50">
              <svg className="h-6 w-6 text-primary-700" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 7V6a2 2 0 012-2h12a2 2 0 012 2v1M2 7h20l-2 13H4L2 7z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{offer.title}</p>
              <p className="text-sm text-slate-500">{offer.businessName}</p>
              <p className="mt-1 text-sm text-slate-700">
                {quantity} adet × {formatCurrency(offer.priceDiscounted)}
              </p>
            </div>
          </div>
        </section>

        {/* Pickup info */}
        <section className="mt-4 rounded-xl border border-slate-100 p-4">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Teslim noktası</h2>
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <p>{offer.address}</p>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <svg className="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{dateLabel} · {offer.pickupStart}–{offer.pickupEnd}</p>
          </div>
        </section>

        {/* Pickup note */}
        <section className="mt-4 rounded-xl border border-slate-100 p-4">
          <h2 className="mb-2 text-sm font-bold text-slate-900">Teslim notu (opsiyonel)</h2>
          <textarea
            value={pickupNote}
            onChange={(e) => setPickupNote(e.target.value)}
            placeholder="Örn: Kapıda bırakın, zil çalın..."
            maxLength={200}
            rows={2}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </section>

        {/* Wallet credit */}
        {walletBalance > 0 && (
          <section className="mt-4 rounded-xl border border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Cüzdan kredisi</h2>
                <p className="text-xs text-slate-500">
                  Bakiye: {formatCurrency(walletBalance / 100)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUseCredit(!useCredit)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  useCredit ? 'bg-primary-700' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    useCredit ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {useCredit && (
              <p className="mt-2 text-sm font-medium text-primary-700">
                -{formatCurrency(creditApplied / 100)} uygulandı
              </p>
            )}
          </section>
        )}

        {/* Price breakdown */}
        <section className="mt-4 rounded-xl border border-slate-100 p-4">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Fiyat detayı</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Ara toplam ({quantity} adet)</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>KDV (%8)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Hizmet bedeli</span>
              <span>{formatCurrency(serviceFee)}</span>
            </div>
            {useCredit && creditApplied > 0 && (
              <div className="flex justify-between text-primary-700">
                <span>Kredi indirimi</span>
                <span>-{formatCurrency(creditApplied / 100)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900">
              <span>Toplam</span>
              <span className="text-primary-700">{formatCurrency(total)}</span>
            </div>
          </div>
        </section>

        {error && <p className="mt-4 text-center text-sm text-danger-500">{error}</p>}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-100 bg-white px-4 pb-[env(safe-area-inset-bottom)] pt-4">
        <Button variant="primary" fullWidth size="lg" loading={loading} onClick={handleCheckout}>
          Ödemeye Geç · {formatCurrency(total)}
        </Button>
        <p className="mt-2 pb-2 text-center text-xs text-slate-400">
          Ödeme işlemi demo modunda — gerçek ödeme alınmaz.
        </p>
      </div>
    </div>
  );
}
