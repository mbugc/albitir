import { addFavourite, removeFavourite } from './userService';
import { getActiveOffers } from './offerService';
import type { Offer } from '@/types';

export async function toggleFavourite(
  uid: string,
  offerId: string,
  currentIds: string[],
): Promise<string[]> {
  if (currentIds.includes(offerId)) {
    await removeFavourite(uid, offerId);
    return currentIds.filter((id) => id !== offerId);
  } else {
    await addFavourite(uid, offerId);
    return [...currentIds, offerId];
  }
}

export async function getFavouriteOffers(favouriteIds: string[]): Promise<Offer[]> {
  if (favouriteIds.length === 0) return [];
  const all = await getActiveOffers();
  return all.filter((o) => favouriteIds.includes(o.id));
}
