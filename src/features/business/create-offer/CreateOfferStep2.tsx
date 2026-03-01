import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveDraft, loadDraft } from './offerDraft';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import StepProgress from '@/components/ui/StepProgress';
import PageHeader from '@/components/ui/PageHeader';
import { formatCurrency } from '@/utils/formatCurrency';
import { COMMISSION_RATE } from '@/types';
import { cn } from '@/utils/cn';

const DISCOUNT_OPTIONS = [40, 45, 50, 55, 60] as const;
const RECOMMENDED_MIN = 50;

export default function CreateOfferStep2() {
  const navigate = useNavigate();
  const draft = loadDraft();

  const [priceOriginal, setPriceOriginal] = useState(String(draft.priceOriginal ?? ''));
  const [discountPercent, setDiscountPercent] = useState<number | null>(draft.discountPercent ?? null);
  const [error, setError] = useState('');

  const orig = parseFloat(priceOriginal);
  const hasValidOriginal = !isNaN(orig) && orig > 0;
  const hasDiscount = discountPercent !== null;

  const discountedPrice = hasValidOriginal && hasDiscount
    ? parseFloat((orig * (1 - discountPercent / 100)).toFixed(2))
    : 0;

  const commission = discountedPrice > 0
    ? parseFloat((discountedPrice * COMMISSION_RATE).toFixed(2))
    : 0;

  const merchantEarnings = discountedPrice > 0
    ? parseFloat((discountedPrice - commission).toFixed(2))
    : 0;

  const handleNext = () => {
    if (!priceOriginal || !hasValidOriginal) {
      setError('Orijinal fiyat geçersiz.');
      return;
    }
    if (!hasDiscount) {
      setError('Lütfen bir indirim oranı seçin.');
      return;
    }
    saveDraft({
      priceOriginal: orig,
      priceDiscounted: discountedPrice,
      discountPercent,
    });
    navigate('/business/offers/new/schedule');
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <PageHeader title="Sürpriz Çanta Oluştur" showBack />

      <div className="px-6 py-4">
        <StepProgress steps={4} current={2} />
        <p className="mt-2 text-xs text-slate-500">Adım 2 / 4 — Fiyatlandırma</p>
      </div>

      <div className="flex flex-1 flex-col px-6">
        <div className="flex flex-col gap-5">
          {/* Original price */}
          <TextField
            label="Orijinal Fiyat (₺)"
            type="number"
            value={priceOriginal}
            onChange={(e) => {
              setPriceOriginal(e.target.value);
              setError('');
            }}
            placeholder="Örn: 300"
            min="1"
          />

          {/* Discount % selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              İndirim Oranı
            </label>
            <div className="flex flex-wrap gap-2">
              {DISCOUNT_OPTIONS.map((pct) => {
                const isRecommended = pct >= RECOMMENDED_MIN;
                const isSelected = discountPercent === pct;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      setDiscountPercent(pct);
                      setError('');
                    }}
                    className={cn(
                      'relative rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all',
                      isSelected
                        ? 'border-primary-700 bg-primary-50 text-primary-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300',
                    )}
                  >
                    %{pct}
                    {isRecommended && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-success-500 text-[8px] font-bold text-white">
                        *
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              * %50–60 arası önerilir — daha fazla müşteri çeker
            </p>
          </div>

          {/* Calculated discounted price */}
          {hasValidOriginal && hasDiscount && discountedPrice > 0 && (
            <>
              <div className="rounded-xl bg-primary-50 px-4 py-3">
                <p className="text-sm font-semibold text-primary-700">
                  Müşteri Fiyatı: {formatCurrency(discountedPrice)}
                </p>
                <p className="text-sm text-primary-600">
                  {formatCurrency(orig)} yerine {formatCurrency(discountedPrice)} — %{discountPercent} indirim
                </p>
              </div>

              {/* Commission info */}
              <div className="rounded-xl border border-slate-200 px-4 py-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Platform komisyonu: %{Math.round(COMMISSION_RATE * 100)}</span>
                  <span className="font-medium text-slate-700">{formatCurrency(commission)}</span>
                </div>
                <div className="mt-1.5 flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">Kazancınız (adet başı)</span>
                  <span className="font-bold text-success-600">{formatCurrency(merchantEarnings)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-danger-500">{error}</p>}

        <div className="pb-10 pt-6">
          <Button variant="primary" fullWidth onClick={handleNext}>
            Devam et
          </Button>
        </div>
      </div>
    </div>
  );
}
