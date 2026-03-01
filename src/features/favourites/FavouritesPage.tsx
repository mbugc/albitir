import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { getFavouriteOffers, toggleFavourite } from '@/services/favouriteService';
import { updateUser } from '@/services/userService';
import type { Offer } from '@/types';
import OfferCard from '@/components/offer/OfferCard';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import Button from '@/components/ui/Button';

export default function FavouritesPage() {
  const navigate = useNavigate();
  const { userProfile, setUserProfile } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [favouriteIds, setFavouriteIds] = useState<string[]>(
    userProfile?.favouriteOfferIds ?? [],
  );

  useEffect(() => {
    const ids = userProfile?.favouriteOfferIds ?? [];
    setFavouriteIds(ids);
    getFavouriteOffers(ids).then((data) => {
      setOffers(data);
      setLoading(false);
    });
  }, [userProfile?.favouriteOfferIds]);

  const handleFavourite = useCallback(
    async (offerId: string) => {
      if (!userProfile) return;
      const newIds = await toggleFavourite(userProfile.id, offerId, favouriteIds);
      setFavouriteIds(newIds);
      setOffers((prev) => prev.filter((o) => newIds.includes(o.id)));
      await updateUser(userProfile.id, { favouriteOfferIds: newIds });
      setUserProfile({ ...userProfile, favouriteOfferIds: newIds });
    },
    [userProfile, favouriteIds, setUserProfile],
  );

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="bg-white px-4 pb-4 pt-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Favorilerim</h1>
      </header>

      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl bg-white shadow-sm">
                <Skeleton className="h-36 w-full rounded-none" />
                <div className="space-y-2 p-3">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : offers.length === 0 ? (
          <EmptyState
            icon={
              <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            }
            title="Henüz favori yok"
            description="Tekliflerdeki kalp ikonuna tıklayarak favorilerine ekle."
            action={
              <Button variant="primary" onClick={() => navigate('/discover')}>
                Teklifleri keşfet
              </Button>
            }
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
    </div>
  );
}