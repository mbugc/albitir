import { useNavigate } from 'react-router-dom';
import type { Offer } from '@/types';
import OfferCard from '@/components/offer/OfferCard';
import { OfferCardSkeleton } from '@/components/ui/SkeletonLoader';

interface OfferCarouselProps {
  title: string;
  offers: Offer[];
  loading?: boolean;
  favouriteIds: string[];
  onFavouriteToggle: (id: string) => void;
  seeAllPath?: string;
}

export default function OfferCarousel({
  title,
  offers,
  loading,
  favouriteIds,
  onFavouriteToggle,
  seeAllPath,
}: OfferCarouselProps) {
  const navigate = useNavigate();

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between px-4">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {seeAllPath && (
          <button
            onClick={() => navigate(seeAllPath)}
            className="text-sm font-semibold text-primary-700"
          >
            Tümünü gör
          </button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-44 shrink-0">
                <OfferCardSkeleton />
              </div>
            ))
          : offers.length === 0
          ? (
            <p className="py-6 text-sm text-slate-400">Henüz teklif yok.</p>
          )
          : offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                isFavourite={favouriteIds.includes(offer.id)}
                onFavouriteToggle={onFavouriteToggle}
                className="w-44 shrink-0"
              />
            ))}
      </div>
    </section>
  );
}
