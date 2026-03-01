export interface CreateOfferDraft {
  title: string;
  description: string;
  priceOriginal: number;
  priceDiscounted: number;
  discountPercent: number;
  quantityTotal: number;
  daysOfWeek: number[];
  pickupStart: string;
  pickupEnd: string;
}

const DRAFT_KEY = 'albitir_offer_draft';

export function loadDraft(): Partial<CreateOfferDraft> {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function saveDraft(data: Partial<CreateOfferDraft>) {
  const current = loadDraft();
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...current, ...data }));
}

export function clearDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}
