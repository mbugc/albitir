import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import type { Offer, InventoryStatus } from '@/types';
import PriceDisplay from './PriceDisplay';
import RatingDisplay from './RatingDisplay';
import CollectionWindow from './CollectionWindow';
import AvailabilityBadge from './AvailabilityBadge';
import { getNextPickupDate } from '@/utils/formatDate';

interface OfferCardProps {
  offer: Offer;
  isFavourite?: boolean;
  onFavouriteToggle?: (offerId: string) => void;
  distance?: number; // km
  className?: string;
}

function getInventoryStatus(offer: Offer): InventoryStatus {
  if (offer.quantityAvailable === 0) return { type: 'soldOut' };
  if (offer.quantityAvailable <= 3) return { type: 'limited', count: offer.quantityAvailable };
  return { type: 'available', count: offer.quantityAvailable };
}

function isNewOffer(offer: Offer): boolean {
  try {
    const created = offer.createdAt.toDate();
    return Date.now() - created.getTime() < 7 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export default function OfferCard({
  offer,
  isFavourite = false,
  onFavouriteToggle,
  distance,
  className,
}: OfferCardProps) {
  const inventoryStatus = getInventoryStatus(offer);
  const isNew = isNewOffer(offer);
  const nextPickupDate = getNextPickupDate(offer.daysOfWeek);

  const handleFavourite = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavouriteToggle?.(offer.id);
  };

  return (
    <Link
      to={`/offers/${offer.id}`}
      className={cn(
        'relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-transform active:scale-[0.98]',
        inventoryStatus.type === 'soldOut' && 'opacity-70',
        className,
      )}
    >
      {/* Hero image */}
      <div className="relative h-36 bg-slate-200">
        {offer.images[0] ? (
          <img src={offer.images[0]} alt={offer.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-12 w-12 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 7V6a2 2 0 012-2h12a2 2 0 012 2v1M2 7h20l-2 13H4L2 7z" />
            </svg>
          </div>
        )}

        {/* Availability badge */}
        <div className="absolute bottom-2 left-2">
          <AvailabilityBadge status={inventoryStatus} isNew={isNew} />
        </div>

        {/* Favourite button */}
        {onFavouriteToggle && (
          <button
            type="button"
            onClick={handleFavourite}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm"
          >
            <svg
              className={cn(
                'h-4 w-4 transition-colors',
                isFavourite ? 'text-danger-500' : 'text-slate-400',
              )}
              viewBox="0 0 24 24"
              fill={isFavourite ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Card content */}
      <div className="flex flex-col gap-1 p-3">
        <p className="truncate text-xs text-slate-500">{offer.businessName}</p>
        <p className="truncate text-sm font-semibold text-slate-900">{offer.title}</p>
        <PriceDisplay
          original={offer.priceOriginal}
          discounted={offer.priceDiscounted}
          currency={offer.currency}
          size="sm"
        />
        <div className="flex items-center gap-2">
          <RatingDisplay rating={offer.rating} size="sm" />
          {distance !== undefined && (
            <span className="text-xs text-slate-400">
              {distance < 1
                ? `${Math.round(distance * 1000)}m`
                : `${distance.toFixed(1)}km`}
            </span>
          )}
        </div>
        <CollectionWindow
          pickupStart={offer.pickupStart}
          pickupEnd={offer.pickupEnd}
          pickupDate={nextPickupDate}
          size="sm"
        />
      </div>
    </Link>
  );
}
