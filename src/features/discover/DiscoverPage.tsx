import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { getActiveOffers } from '@/services/offerService';
import { toggleFavourite } from '@/services/favouriteService';
import { updateUser } from '@/services/userService';
import type { Offer, SurplusCategory } from '@/types';
import { SURPLUS_CATEGORY_LABELS } from '@/types';
import OfferCarousel from './OfferCarousel';
import OfferCard from '@/components/offer/OfferCard';
import { Skeleton } from '@/components/ui/SkeletonLoader';

const MapView = lazy(() => import('./MapView'));

type ViewMode = 'feed' | 'map';
type CategoryFilter = 'all' | SurplusCategory;

const CATEGORIES: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  ...(Object.entries(SURPLUS_CATEGORY_LABELS) as [SurplusCategory, string][]).map(([key, label]) => ({
    key: key as CategoryFilter,
    label,
  })),
];

export default function DiscoverPage() {
  const { userProfile, setUserProfile } = useAuth();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [favouriteIds, setFavouriteIds] = useState<string[]>(
    userProfile?.favouriteOfferIds ?? [],
  );
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('feed');

  useEffect(() => {
    getActiveOffers().then((data) => {
      setOffers(data);
      setLoading(false);
    });
  }, []);

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

  const filtered = useMemo(() => {
    let result = offers;
    if (category !== 'all') {
      result = result.filter((o) => o.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.businessName.toLowerCase().includes(q),
      );
    }
    return result;
  }, [offers, category, search]);

  const isSearching = search.trim().length > 0 || category !== 'all';

  const recommended = offers.slice(0, 10);
  const newOffers = [...offers]
    .sort((a, b) => {
      try {
        return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
      } catch {
        return 0;
      }
    })
    .slice(0, 10);

  const firstName = userProfile?.name?.split(' ')[0] ?? 'Merhaba';
  const mapCenter: [number, number] = userProfile?.location
    ? [userProfile.location.latitude, userProfile.location.longitude]
    : [41.0082, 28.9784];

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Header */}
      <header className="bg-white px-4 pb-3 pt-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500">Merhaba</p>
            <h1 className="text-xl font-bold text-slate-900">{firstName}</h1>
          </div>
          {userProfile?.location && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1">
              <svg className="h-3.5 w-3.5 text-primary-700" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.013 3.5-4.636 3.5-7.327a7.5 7.5 0 10-15 0c0 2.69 1.556 5.314 3.5 7.327a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-primary-700">
                {userProfile.location.city}
              </span>
            </div>
          )}
        </div>

        {/* Search bar */}
        <div className="relative mt-3">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Restoran, fırın veya çanta ara..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Category chips */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                category === cat.key
                  ? 'bg-primary-700 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Feed / Map toggle */}
        <div className="mt-3 flex rounded-lg bg-slate-100 p-0.5">
          <button
            onClick={() => setViewMode('feed')}
            className={`flex-1 rounded-md py-1.5 text-center text-sm font-semibold transition-colors ${
              viewMode === 'feed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Feed
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex-1 rounded-md py-1.5 text-center text-sm font-semibold transition-colors ${
              viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Harita
          </button>
        </div>
      </header>

      {/* Content */}
      {viewMode === 'map' ? (
        <div className="h-[calc(100dvh-280px)]">
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <MapView offers={filtered} center={mapCenter} />
          </Suspense>
        </div>
      ) : isSearching ? (
        <div className="px-4 py-4">
          <p className="mb-3 text-sm text-slate-500">
            {filtered.length} sonuç bulundu
          </p>
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <svg className="mx-auto h-10 w-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <p className="mt-2 text-sm text-slate-500">Sonuç bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((offer) => (
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
      ) : (
        <div className="pt-6">
          <OfferCarousel
            title="Senin için öneriler"
            offers={recommended}
            loading={loading}
            favouriteIds={favouriteIds}
            onFavouriteToggle={handleFavourite}
            seeAllPath="/browse"
          />
          <OfferCarousel
            title="Yeni Sürpriz Çantalar"
            offers={newOffers}
            loading={loading}
            favouriteIds={favouriteIds}
            onFavouriteToggle={handleFavourite}
            seeAllPath="/browse"
          />
        </div>
      )}
    </div>
  );
}
