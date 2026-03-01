import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { getMyOrders } from '@/services/orderService';
import type { Order, OrderStatus } from '@/types';
import { ORDER_STATUS_LABELS } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { getPickupDateLabel } from '@/utils/formatDate';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/SkeletonLoader';

const STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
  CREATED: 'primary',
  PAID: 'success',
  READY: 'accent',
  COMPLETED: 'neutral',
  NO_SHOW: 'danger',
};

const ACTIVE_STATUSES: OrderStatus[] = ['CREATED', 'PAID', 'READY'];
const PAST_STATUSES: OrderStatus[] = ['COMPLETED', 'NO_SHOW'];

function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate();
  const dateLabel = getPickupDateLabel(order.pickupDate);

  return (
    <button
      onClick={() => navigate(`/orders/${order.id}`)}
      className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-left shadow-sm active:scale-[0.98] transition-transform"
    >
      <div className="flex-1 min-w-0">
        <p className="truncate font-semibold text-slate-900">{order.offerTitle}</p>
        <p className="truncate text-sm text-slate-500">{order.businessName}</p>
        <p className="mt-1 text-xs text-slate-400">
          {dateLabel} · {order.pickupStart}–{order.pickupEnd}
        </p>
        {order.orderNumber && (
          <p className="mt-0.5 text-xs font-medium text-slate-400">{order.orderNumber}</p>
        )}
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1.5">
        <Badge variant={STATUS_VARIANT[order.status]}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
        <p className="text-sm font-bold text-slate-900">{formatCurrency(order.total)}</p>
      </div>
    </button>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'past'>('active');

  useEffect(() => {
    if (!userProfile) return;
    getMyOrders(userProfile.id).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, [userProfile]);

  const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const past = orders.filter((o) => PAST_STATUSES.includes(o.status));
  const shown = tab === 'active' ? active : past;

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="bg-white px-4 pb-0 pt-6 shadow-sm">
        <h1 className="mb-3 text-xl font-bold text-slate-900">Siparişlerim</h1>
        <div className="flex gap-1">
          {(['active', 'past'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 border-b-2 py-2 text-sm font-semibold transition-colors ${
                tab === t
                  ? 'border-primary-700 text-primary-700'
                  : 'border-transparent text-slate-400'
              }`}
            >
              {t === 'active' ? `Aktif (${active.length})` : `Geçmiş (${past.length})`}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-3 p-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))
        ) : shown.length === 0 ? (
          <EmptyState
            title={tab === 'active' ? 'Henüz siparişin yok' : 'Geçmiş sipariş yok'}
            description={tab === 'active' ? 'Yeni bir sürpriz çanta sipariş et!' : undefined}
            action={
              tab === 'active' ? (
                <Button variant="primary" onClick={() => navigate('/discover')}>
                  Teklifleri keşfet
                </Button>
              ) : undefined
            }
          />
        ) : (
          shown.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );
}
