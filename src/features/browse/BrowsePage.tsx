import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { getActiveOffers } from '@/services/offerService';
import { toggleFavourite } from '@/services/favouriteService';
import { updateUser } from '@/services/userService';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import type { Offer, SortOption } from '@/types';
import OfferCard from '@/components/offer/OfferCard';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import EmptyState from '@/components/ui/EmptyState';
import SortSheet from './SortSheet';

export default function BrowsePage() {
  const { userProfile, setUserProfile } = useAuth();
  const sortSheet = useBottomSheet();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>('relevance');
  const [favouriteIds, setFavouriteIds] = useState<string[]>(
    userProfile?.favouriteOfferIds ?? [],
  );

  useEffect(() => {
    setLoading(true);
    getActiveOffers(sort).then((data) => {
      setOffers(data);
      setLoading(false);
    });
  }, [sort]);

  useEffect(() => {
    setFavouriteIds(userProfile?.favouriteOfferIds ?? []);
  }, [userProfile]);

  const handleFavourite = useCallback(
    async (offerId: string) => {
      if (!userProfile) return;
      const newIds = await toggleFavourite(userProfile.id, offerId, favouriteIds);
      setFavouriteIds(newIds);
      await updateUser(userProfile.id, { favouriteOfferIds: newIds });
      setUserProfile({ ...userProfile, favouriteOfferIds: newIds });
    },
    [userProfile, favouriteIds, setUserProfile],
  );

  const sortLabel: Record<SortOption, string> = {
    relevance: 'İlgililik',
    distance: 'Mesafe',
    price: 'Fiyat',
    rating: 'Puan',
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-10 bg-white px-4 pb-3 pt-5 shadow-sm">
        <h1 className="mb-3 text-xl font-bold text-slate-900">Keşfet</h1>
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <span className="text-sm text-slate-400">İşletme veya kategori ara...</span>
          </div>
          <button
            onClick={sortSheet.open}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
          >
            <svg className="h-4 w-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h18M6 12h12M9 16.5h6" />
            </svg>
            <span className="text-xs font-semibold text-slate-700">{sortLabel[sort]}</span>
          </button>
        </div>
      </header>

      <div className="p-4">
        {loading ? (
          <SkeletonLoader count={6} columns={2} />
        ) : offers.length === 0 ? (
          <EmptyState
            icon={<svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>}
            title="Teklif bulunamadı"
            description="Henüz bölgenizde teklifler listelenmemiş."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                isFavourite={favouriteIds.includes(offer.id)}
                onFavouriteToggle={handleFavourite}
              />
            ))}
          </div>
        )}
      </div>

      <SortSheet
        isOpen={sortSheet.isOpen}
        current={sort}
        onClose={sortSheet.close}
        onChange={setSort}
      />
    </div>
  );
}
