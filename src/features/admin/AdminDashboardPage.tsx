import { useState, useEffect } from 'react';
import { getAdminStats, getRecentOrders } from '@/services/adminService';
import type { AdminStats } from '@/services/adminService';
import type { Order } from '@/types';
import { ORDER_STATUS_LABELS } from '@/types';
import Badge from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { formatCurrency } from '@/utils/formatCurrency';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminStats(), getRecentOrders(10)]).then(([s, o]) => {
      setStats(s);
      setOrders(o);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Toplam Sipariş" value={String(stats?.totalOrders ?? 0)} color="primary" />
        <StatCard label="Toplam Müşteri" value={String(stats?.totalConsumers ?? 0)} color="primary" />
        <StatCard label="Onaylı İşletme" value={String(stats?.approvedMerchants ?? 0)} color="success" />
        <StatCard label="Bekleyen İşletme" value={String(stats?.pendingMerchants ?? 0)} color="warning" />
      </div>

      {/* Recent orders */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Son Siparişler</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-slate-500">Henüz sipariş yok.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Sipariş No</th>
                  <th className="px-4 py-3 font-medium">Teklif</th>
                  <th className="px-4 py-3 font-medium">İşletme</th>
                  <th className="px-4 py-3 font-medium">Toplam</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{order.offerTitle}</td>
                    <td className="px-4 py-3 text-slate-600">{order.businessName}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="neutral">{ORDER_STATUS_LABELS[order.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: 'primary' | 'success' | 'warning' }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
  };

  return (
    <div className={`rounded-xl p-4 ${colorClasses[color]}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
