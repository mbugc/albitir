import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOfferById, updateOffer } from '@/services/offerService';
import { DAYS_OF_WEEK, COMMISSION_RATE } from '@/types';
import type { Offer } from '@/types';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import PageHeader from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { formatCurrency } from '@/utils/formatCurrency';
import { cn } from '@/utils/cn';

const DISCOUNT_OPTIONS = [40, 45, 50, 55, 60] as const;
const RECOMMENDED_MIN = 50;

export default function EditOfferPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceOriginal, setPriceOriginal] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);
  const [quantityTotal, setQuantityTotal] = useState('');
  const [days, setDays] = useState<number[]>([]);
  const [pickupStart, setPickupStart] = useState('');
  const [pickupEnd, setPickupEnd] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!id) return;
    getOfferById(id).then((data) => {
      if (data) {
        setOffer(data);
        setTitle(data.title);
        setDescription(data.description);
        setPriceOriginal(String(data.priceOriginal));
        setDiscountPercent(data.discountPercent ?? null);
        setQuantityTotal(String(data.quantityTotal));
        setDays(data.daysOfWeek);
        setPickupStart(data.pickupStart);
        setPickupEnd(data.pickupEnd);
        setIsActive(data.isActive);
      }
      setLoading(false);
    });
  }, [id]);

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

  const toggleDay = (d: number) =>
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b));

  const handleSave = async () => {
    if (!offer) return;
    if (!title.trim()) { setError('İsim zorunlu.'); return; }
    if (!hasValidOriginal) { setError('Orijinal fiyat geçersiz.'); return; }
    if (!hasDiscount) { setError('Lütfen bir indirim oranı seçin.'); return; }
    if (discountedPrice <= 0) { setError('Fiyatları kontrol edin.'); return; }
    setSaving(true);
    setError('');
    try {
      await updateOffer(offer.id, {
        title: title.trim(),
        description: description.trim(),
        priceOriginal: orig,
        priceDiscounted: discountedPrice,
        discountPercent,
        quantityTotal: parseInt(quantityTotal),
        daysOfWeek: days,
        pickupStart,
        pickupEnd,
        isActive,
      });
      navigate('/business/dashboard');
    } catch {
      setError('Kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <p className="text-slate-500">Teklif bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <PageHeader title="Teklifi Düzenle" showBack />

      <div className="flex flex-1 flex-col gap-4 px-6 pt-4">
        <TextField label="İsim" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={40} />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Açıklama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={200}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-primary-600"
          />
        </div>

        {/* Original Price */}
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

        {/* Calculated pricing info */}
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

        <TextField label="Günlük Adet" type="number" value={quantityTotal} onChange={(e) => setQuantityTotal(e.target.value)} />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Günler</label>
          <div className="flex gap-2 flex-wrap">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={cn(
                  'rounded-xl border px-3 py-2 text-sm font-semibold',
                  days.includes(day.value)
                    ? 'border-primary-700 bg-primary-50 text-primary-700'
                    : 'border-slate-200 text-slate-500'
                )}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Teslim saatleri</label>
          <div className="flex items-center gap-3">
            <input type="time" value={pickupStart} onChange={(e) => setPickupStart(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-base outline-none" />
            <span className="text-slate-400">–</span>
            <input type="time" value={pickupEnd} onChange={(e) => setPickupEnd(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-base outline-none" />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-primary-700"
          />
          <span className="text-sm font-medium text-slate-700">Teklif aktif</span>
        </label>

        {error && <p className="text-sm text-danger-500">{error}</p>}

        <div className="pb-10 pt-2">
          <Button variant="primary" fullWidth loading={saving} onClick={handleSave}>
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
}
