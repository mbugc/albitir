import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { getBusinessByOwner } from '@/services/businessService';
import { getBusinessOffers, updateOffer } from '@/services/offerService';
import { getBusinessOrders } from '@/services/orderService';
import type { Business, Offer, Order } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils/formatCurrency';

export default function BusinessDashboardPage() {
  const navigate = useNavigate();
  const { firebaseUser, signOut } = useAuth();

  const [business, setBusiness] = useState<Business | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    getBusinessByOwner(firebaseUser.uid).then((biz) => {
      setBusiness(biz);
      if (biz) {
        Promise.all([getBusinessOffers(biz.id), getBusinessOrders(biz.id)]).then(
          ([offerData, orderData]) => {
            setOffers(offerData);
            setOrders(orderData);
            setLoading(false);
          },
        );
      } else {
        setLoading(false);
        navigate('/business/signup', { replace: true });
      }
    });
  }, [firebaseUser, navigate]);
  const handleToggleActive = async (offer: Offer) => {
    await updateOffer(offer.id, { isActive: !offer.isActive });
    setOffers((prev) =>
      prev.map((o) => (o.id === offer.id ? { ...o, isActive: !o.isActive } : o)),
    );
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/business/auth', { replace: true });
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="bg-primary-700 px-4 pb-6 pt-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-primary-200">İşletme Paneli</p>
            <h1 className="text-xl font-black">{business?.name ?? '...'}</h1>
          </div>
          <button onClick={handleSignOut} className="text-xs text-primary-200 underline">
            Çıkış
          </button>
        </div>
      </header>
      {/* Order summary cards */}
      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Aktif siparişler</p>
          <p className="text-2xl font-bold text-slate-900">
            {orders.filter((o) => o.status === 'PAID' || o.status === 'READY').length}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Toplam gelir</p>
          <p className="text-2xl font-bold text-primary-700">
            {formatCurrency(
              orders
                .filter((o) => o.status === 'COMPLETED')
                .reduce((sum, o) => sum + o.subtotal - o.commission, 0),
            )}
          </p>
        </div>
      </div>

      <div className="flex gap-3 px-4 py-4">
        <Button variant="primary" fullWidth onClick={() => navigate('/business/offers/new')}>
          + Yeni Çanta
        </Button>
        <Button variant="secondary" fullWidth onClick={() => navigate('/business/orders')}>
          Siparişler ({orders.filter((o) => o.status === 'PAID' || o.status === 'READY').length})
        </Button>
      </div>

      <div className="px-4 pb-10">
        <h2 className="mb-3 text-base font-bold text-slate-900">Tekliflerim ({offers.length})</h2>

        {offers.length === 0 ? (
          <EmptyState
            icon={
              <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            }
            title="Henüz teklif yok"
            description="İlk sürpriz çantanı oluştur!"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {offers.map((offer) => (
              <div key={offer.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-slate-900">{offer.title}</p>
                      <Badge variant={offer.isActive ? 'success' : 'neutral'}>
                        {offer.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatCurrency(offer.priceDiscounted)} · {offer.quantityAvailable}/{offer.quantityTotal} mevcut
                    </p>
                    <p className="text-xs text-slate-400">{offer.pickupStart}–{offer.pickupEnd}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      onClick={() => navigate(`/business/offers/${offer.id}/edit`)}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleToggleActive(offer)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        offer.isActive ? 'bg-slate-100 text-slate-600' : 'bg-primary-50 text-primary-700'
                      }`}
                    >
                      {offer.isActive ? 'Durdur' : 'Etkinleştir'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
