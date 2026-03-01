import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderById, updateOrderStatus, verifyPickupCode } from '@/services/orderService';
import type { Order, OrderStatus } from '@/types';
import { ORDER_STATUS_LABELS } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { formatCurrency } from '@/utils/formatCurrency';

const STATUS_BADGE_VARIANT: Record<OrderStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  CREATED: 'neutral',
  PAID: 'warning',
  READY: 'success',
  COMPLETED: 'success',
  NO_SHOW: 'danger',
};

export default function MerchantOrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pickupInput, setPickupInput] = useState('');
  const [pickupError, setPickupError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getOrderById(id).then((data) => {
      setOrder(data);
      setLoading(false);
    });
  }, [id]);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;
    setActionLoading(true);
    setError('');
    try {
      await updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyAndComplete = async () => {
    if (!order) return;
    setPickupError('');
    setActionLoading(true);
    try {
      const valid = await verifyPickupCode(order.id, pickupInput.trim());
      if (!valid) {
        setPickupError('Kod hatalı. Lütfen tekrar deneyin.');
        setActionLoading(false);
        return;
      }
      await updateOrderStatus(order.id, 'COMPLETED');
      setOrder({ ...order, status: 'COMPLETED' });
    } catch (e: unknown) {
      setPickupError(e instanceof Error ? e.message : 'Bir hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-white">
        <PageHeader title="Sipariş Detay" showBack />
        <div className="space-y-3 p-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-dvh bg-white">
        <PageHeader title="Sipariş Detay" showBack />
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="text-slate-500">Sipariş bulunamadı.</p>
        </div>
      </div>
    );
  }

  const rows = [
    { label: 'Sipariş No', value: order.orderNumber },
    { label: 'Teklif', value: order.offerTitle },
    { label: 'Adet', value: String(order.quantity) },
    { label: 'Birim fiyat', value: formatCurrency(order.pricePerUnit) },
    { label: 'Ara toplam', value: formatCurrency(order.subtotal) },
    { label: 'KDV', value: formatCurrency(order.tax) },
    { label: 'Komisyon (%25)', value: formatCurrency(order.commission) },
    ...(order.creditApplied > 0 ? [{ label: 'Kredi', value: `-${formatCurrency(order.creditApplied / 100)}` }] : []),
    { label: 'Toplam', value: formatCurrency(order.total) },
  ];

  const netEarnings = order.subtotal - order.commission;

  return (
    <div className="min-h-dvh bg-white">
      <PageHeader title="Sipariş Detay" showBack />

      <div className="px-4 py-4">
        {/* Status badge */}
        <div className="mb-4 flex items-center gap-3">
          <Badge variant={STATUS_BADGE_VARIANT[order.status]} className="text-sm">
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
          <span className="text-sm text-slate-500">{order.orderNumber}</span>
        </div>

        {/* Pickup info */}
        <section className="mb-4 rounded-xl border border-slate-100 p-4">
          <h3 className="mb-2 text-sm font-bold text-slate-900">Teslim bilgileri</h3>
          <div className="space-y-1 text-sm text-slate-600">
            <p>Tarih: {order.pickupDate}</p>
            <p>Saat: {order.pickupStart}–{order.pickupEnd}</p>
            {order.pickupNote && (
              <p className="italic text-slate-500">Not: {order.pickupNote}</p>
            )}
          </div>
        </section>

        {/* Order details */}
        <section className="mb-4 rounded-xl border border-slate-100 overflow-hidden">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`flex justify-between gap-4 px-4 py-3 ${
                i < rows.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <span className="text-sm text-slate-500">{row.label}</span>
              <span className="text-right text-sm font-medium text-slate-900">{row.value}</span>
            </div>
          ))}
        </section>

        {/* Net earnings */}
        <div className="mb-6 rounded-xl bg-primary-50 p-4">
          <p className="text-sm text-primary-700">Net kazanç (komisyon sonrası)</p>
          <p className="text-xl font-bold text-primary-800">{formatCurrency(netEarnings)}</p>
        </div>

        {error && <p className="mb-4 text-center text-sm text-danger-500">{error}</p>}

        {/* Action buttons by status */}
        {order.status === 'PAID' && (
          <div className="space-y-3">
            <Button variant="primary" fullWidth loading={actionLoading} onClick={() => handleStatusUpdate('READY')}>
              Hazır olarak işaretle
            </Button>
            <Button variant="danger" fullWidth loading={actionLoading} onClick={() => handleStatusUpdate('NO_SHOW')}>
              Müşteri gelmedi
            </Button>
          </div>
        )}

        {order.status === 'READY' && (
          <div className="space-y-4">
            {/* Pickup code verification */}
            <div className="rounded-xl border border-slate-100 p-4">
              <h3 className="mb-2 text-sm font-bold text-slate-900">Teslim kodu doğrulama</h3>
              <p className="mb-3 text-xs text-slate-500">
                Müşterinin size gösterdiği 4 haneli kodu girin.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={pickupInput}
                  onChange={(e) => {
                    setPickupInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                    setPickupError('');
                  }}
                  placeholder="0000"
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-slate-900 placeholder:text-slate-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              {pickupError && <p className="mt-2 text-sm text-danger-500">{pickupError}</p>}
            </div>

            <Button
              variant="primary"
              fullWidth
              loading={actionLoading}
              disabled={pickupInput.length !== 4}
              onClick={handleVerifyAndComplete}
            >
              Doğrula ve Teslim et
            </Button>

            <Button variant="danger" fullWidth loading={actionLoading} onClick={() => handleStatusUpdate('NO_SHOW')}>
              Müşteri gelmedi
            </Button>
          </div>
        )}

        {(order.status === 'COMPLETED' || order.status === 'NO_SHOW') && (
          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <p className="text-sm text-slate-500">
              {order.status === 'COMPLETED' ? 'Bu sipariş teslim edildi.' : 'Müşteri teslim almadı.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
