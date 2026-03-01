import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { getBusinessByOwner } from '@/services/businessService';
import { getBusinessOrders } from '@/services/orderService';
import type { Order, OrderStatus } from '@/types';
import { ORDER_STATUS_LABELS } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils/formatCurrency';

type TabKey = 'new' | 'ready' | 'completed' | 'no_show';

const TABS: { key: TabKey; label: string; statuses: OrderStatus[] }[] = [
  { key: 'new', label: 'Yeni', statuses: ['PAID'] },
  { key: 'ready', label: 'Hazır', statuses: ['READY'] },
  { key: 'completed', label: 'Teslim', statuses: ['COMPLETED'] },
  { key: 'no_show', label: 'Gelmedi', statuses: ['NO_SHOW'] },
];

const STATUS_BADGE_VARIANT: Record<OrderStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  CREATED: 'neutral',
  PAID: 'warning',
  READY: 'success',
  COMPLETED: 'success',
  NO_SHOW: 'danger',
};

export default function MerchantOrdersPage() {
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('new');

  useEffect(() => {
    if (!firebaseUser) return;
    getBusinessByOwner(firebaseUser.uid).then((biz) => {
      if (!biz) return;
      getBusinessOrders(biz.id).then((data) => {
        setOrders(data);
        setLoading(false);
      });
    });
  }, [firebaseUser]);

  const currentTab = TABS.find((t) => t.key === activeTab)!;
  const filtered = orders.filter((o) => currentTab.statuses.includes(o.status));

  if (loading) {
    return (
      <div className="min-h-dvh bg-white">
        <PageHeader title="Siparişler" showBack />
        <div className="space-y-3 p-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white">
      <PageHeader title="Siparişler" showBack />

      {/* Tabs */}
      <div className="flex border-b border-slate-100 px-4">
        {TABS.map((tab) => {
          const count = orders.filter((o) => tab.statuses.includes(o.status)).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 border-b-2 pb-3 pt-3 text-center text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-700 text-primary-700'
                  : 'border-transparent text-slate-400'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Order list */}
      <div className="px-4 py-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={
              <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            }
            title="Bu kategoride sipariş yok"
            description=""
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/business/orders/${order.id}`)}
                className="w-full rounded-xl border border-slate-100 p-4 text-left transition-colors hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-slate-900">{order.offerTitle}</p>
                      <Badge variant={STATUS_BADGE_VARIANT[order.status]}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.orderNumber} · {order.quantity} adet
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.pickupDate} · {order.pickupStart}–{order.pickupEnd}
                    </p>
                    {order.pickupNote && (
                      <p className="mt-1 text-xs text-slate-500 italic">Not: {order.pickupNote}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-slate-400">Komisyon: {formatCurrency(order.commission)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
