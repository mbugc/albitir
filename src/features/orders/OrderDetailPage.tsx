import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getOrderById } from '@/services/orderService';
import type { Order, OrderStatus } from '@/types';
import { ORDER_STATUS_LABELS } from '@/types';
import Badge from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatCurrency';
import { getPickupDateLabel } from '@/utils/formatDate';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import RatingPrompt from './RatingPrompt';

const STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
  CREATED: 'primary',
  PAID: 'success',
  READY: 'accent',
  COMPLETED: 'neutral',
  NO_SHOW: 'danger',
};

function useCountdown(pickupDate: string, pickupEnd: string) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const [h, m] = pickupEnd.split(':').map(Number);
    const end = new Date(pickupDate + 'T00:00:00');
    end.setHours(h, m, 0, 0);

    const update = () => {
      const diff = end.getTime() - Date.now();
      if (diff <= 0) { setRemaining('Pencere kapandı'); return; }
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      if (hours > 0) setRemaining(`${hours}s ${mins}dk kaldı`);
      else if (mins > 0) setRemaining(`${mins}dk ${secs}sn kaldı`);
      else setRemaining(`${secs}sn kaldı`);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [pickupDate, pickupEnd]);

  return remaining;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);

  const countdown = useCountdown(
    order?.pickupDate ?? '',
    order?.pickupEnd ?? '23:59',
  );

  useEffect(() => {
    if (!id) return;
    getOrderById(id).then((data) => {
      setOrder(data);
      setLoading(false);
      if (data?.status === 'COMPLETED' && !data.rating) {
        setShowRating(true);
      }
    });
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <p className="text-slate-500">Sipariş bulunamadı.</p>
      </div>
    );
  }

  const dateLabel = getPickupDateLabel(order.pickupDate);
  const showPickupCode = order.status === 'PAID' || order.status === 'READY';
  const qrValue = `albitir://order/${order.id}/pickup/${order.pickupCode}`;

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Header */}
      <header className="flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100">
          <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">{order.orderNumber}</p>
          <p className="text-sm text-slate-500">{order.businessName}</p>
        </div>
        <Badge variant={STATUS_VARIANT[order.status]}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </header>

      <div className="flex flex-col gap-4 p-4">
        {/* Pickup code + QR — only shown for PAID or READY */}
        {showPickupCode && (
          <div className="rounded-2xl bg-primary-50 px-6 py-6 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary-600">
              Teslim Alma Kodu
            </p>
            <p className="font-mono text-5xl font-black tracking-[0.3em] text-primary-700">
              {order.pickupCode}
            </p>
            <div className="mx-auto mt-4 inline-block rounded-xl bg-white p-3">
              <QRCodeSVG value={qrValue} size={120} />
            </div>
            <p className="mt-3 text-sm font-semibold text-primary-600">{countdown}</p>
          </div>
        )}

        {/* Rating prompt — shown for completed orders without rating */}
        {showRating && (
          <RatingPrompt
            orderId={order.id}
            onDone={() => setShowRating(false)}
          />
        )}

        {/* Existing rating */}
        {order.rating && (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h3 className="mb-2 font-semibold text-slate-900">Puanın</h3>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <svg
                  key={n}
                  className={`h-5 w-5 ${n <= order.rating!.stars ? 'text-amber-400' : 'text-slate-200'}`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z" clipRule="evenodd" />
                </svg>
              ))}
              {order.rating.comment && (
                <span className="ml-2 text-sm text-slate-500">"{order.rating.comment}"</span>
              )}
            </div>
          </div>
        )}

        {/* Collection details */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-900">Teslim alma bilgileri</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Tarih & Saat</span>
              <span className="font-medium text-slate-900">
                {dateLabel} · {order.pickupStart}–{order.pickupEnd}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Adres</span>
              <span className="font-medium text-slate-900 text-right max-w-[55%]">
                {order.businessAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-900">Sipariş özeti</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">{order.offerTitle} x {order.quantity}</span>
              <span className="text-slate-900">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">KDV (%8)</span>
              <span className="text-slate-900">{formatCurrency(order.tax)}</span>
            </div>
            {order.creditApplied > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Kredi indirimi</span>
                <span className="text-success-600">-{formatCurrency(order.creditApplied / 100)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 font-bold">
              <span>Toplam</span>
              <span className="text-primary-700">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
