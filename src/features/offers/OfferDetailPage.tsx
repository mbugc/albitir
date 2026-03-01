import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { getOfferById } from '@/services/offerService';
import { toggleFavourite } from '@/services/favouriteService';
import { updateUser } from '@/services/userService';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import type { Offer } from '@/types';
import Button from '@/components/ui/Button';
import AvailabilityBadge from '@/components/offer/AvailabilityBadge';
import PriceDisplay from '@/components/offer/PriceDisplay';
import RatingDisplay from '@/components/offer/RatingDisplay';
import CollectionWindow from '@/components/offer/CollectionWindow';
import ReservationSheet from './ReservationSheet';
import { getNextPickupDate } from '@/utils/formatDate';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/SkeletonLoader';

export default function OfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile, setUserProfile } = useAuth();
  const reservationSheet = useBottomSheet();

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (!id) return;
    getOfferById(id).then((data) => {
      setOffer(data);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (offer && userProfile) {
      setIsFav(userProfile.favouriteOfferIds.includes(offer.id));
    }
  }, [offer, userProfile]);

  const handleFavourite = async () => {
    if (!userProfile || !offer) return;
    const newIds = await toggleFavourite(userProfile.id, offer.id, userProfile.favouriteOfferIds);
    setIsFav(newIds.includes(offer.id));
    await updateUser(userProfile.id, { favouriteOfferIds: newIds });
    setUserProfile({ ...userProfile, favouriteOfferIds: newIds });
  };

  const handleReserve = (quantity: number) => {
    if (!offer) return;
    reservationSheet.close();
    navigate('/checkout', {
      state: { offer, quantity },
    });
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="h-64 w-full rounded-none" />
        <div className="space-y-3 p-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-1/3" />
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4 text-center">
        <div>
          <p className="text-slate-500">Teklif bulunamadı.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-primary-700 font-semibold">
            Geri dön
          </button>
        </div>
      </div>
    );
  }

  const isSoldOut = offer.quantityAvailable === 0;
  const inventoryStatus = isSoldOut
    ? { type: 'soldOut' as const }
    : offer.quantityAvailable <= 3
    ? { type: 'limited' as const, count: offer.quantityAvailable }
    : { type: 'available' as const, count: offer.quantityAvailable };
  const nextPickupDate = getNextPickupDate(offer.daysOfWeek);

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Hero */}
      <div className="relative h-64 bg-slate-200">
        {offer.images[0] ? (
          <img src={offer.images[0]} alt={offer.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-20 w-20 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 7V6a2 2 0 012-2h12a2 2 0 012 2v1M2 7h20l-2 13H4L2 7z" />
            </svg>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm"
        >
          <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Heart */}
        <button
          onClick={handleFavourite}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm"
        >
          <svg
            className={cn('h-5 w-5 transition-colors', isFav ? 'text-red-500' : 'text-slate-400')}
            viewBox="0 0 24 24"
            fill={isFav ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {/* Availability badge */}
        <div className="absolute bottom-3 left-4">
          <AvailabilityBadge status={inventoryStatus} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-5">
        <p className="text-sm text-slate-500">{offer.businessName}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{offer.title}</h1>

        <div className="mt-3 flex items-center gap-2">
          <PriceDisplay
            original={offer.priceOriginal}
            discounted={offer.priceDiscounted}
            currency={offer.currency}
            size="lg"
          />
          {offer.discountPercent > 0 && (
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700">
              -%{offer.discountPercent}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <RatingDisplay rating={offer.rating} count={offer.ratingCount} size="md" />
        </div>

        <CollectionWindow
          pickupStart={offer.pickupStart}
          pickupEnd={offer.pickupEnd}
          pickupDate={nextPickupDate}
          size="md"
          className="mt-3"
        />

        <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
          <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <p>{offer.address}</p>
        </div>

        <div className="mt-5">
          <h2 className="mb-2 text-base font-bold text-slate-900">Ne alabileceğin</h2>
          <p className="text-sm text-slate-600">{offer.description}</p>
"          {offer.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {offer.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Reserve Button */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-100 bg-white px-4 pb-[env(safe-area-inset-bottom)] pt-4">
        <Button
          variant="primary"
          fullWidth
          size="lg"
          disabled={isSoldOut}
          onClick={reservationSheet.open}
        >
          {isSoldOut ? 'Tükendi' : `Sipariş ver · ${offer.priceDiscounted.toLocaleString('tr-TR')} ₺`}
        </Button>
      </div>

      <ReservationSheet
        offer={offer}
        isOpen={reservationSheet.isOpen}
        onClose={reservationSheet.close}
        onConfirm={handleReserve}
      />
    </div>
  );
}
