import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { getBusinessByOwner } from '@/services/businessService';
import { createOffer } from '@/services/offerService';
import { loadDraft, clearDraft } from './offerDraft';
import { DAYS_OF_WEEK, SURPLUS_CATEGORY_LABELS } from '@/types';
import Button from '@/components/ui/Button';
import StepProgress from '@/components/ui/StepProgress';
import PageHeader from '@/components/ui/PageHeader';
import { formatCurrency } from '@/utils/formatCurrency';

export default function CreateOfferReview() {
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const draft = loadDraft();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dayLabels = (draft.daysOfWeek ?? [])
    .map((d) => DAYS_OF_WEEK.find((x) => x.value === d)?.label ?? '')
    .join(', ');

  const handleSubmit = async () => {
    if (!firebaseUser) return;
    if (!draft.title || !draft.priceOriginal || !draft.priceDiscounted || !draft.quantityTotal) {
      setError('Eksik bilgi. Lütfen tüm adımları tamamlayın.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const business = await getBusinessByOwner(firebaseUser.uid);
      if (!business) throw new Error('İşletme profili bulunamadı.');

      await createOffer({
        businessId: business.id,
        businessName: business.name,
        businessLogo: undefined,
        title: draft.title,
        description: draft.description ?? '',
        category: business.surplusCategory,
        priceOriginal: draft.priceOriginal,
        priceDiscounted: draft.priceDiscounted,
        discountPercent: draft.discountPercent ?? Math.round((1 - draft.priceDiscounted / draft.priceOriginal) * 100),
        currency: 'TRY',
        quantityTotal: draft.quantityTotal,
        quantityAvailable: draft.quantityTotal,
        daysOfWeek: draft.daysOfWeek ?? [],
        pickupStart: draft.pickupStart ?? '17:00',
        pickupEnd: draft.pickupEnd ?? '19:00',
        images: [],
        tags: [SURPLUS_CATEGORY_LABELS[business.surplusCategory]],
        isActive: true,
        geo: business.geo,
        address: `${business.address.line1}, ${business.address.city}`,
        rating: 0,
        ratingCount: 0,
      });

      clearDraft();
      navigate('/business/dashboard', { replace: true });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const rows = [
    { label: 'İsim', value: draft.title ?? '—' },
    { label: 'Açıklama', value: draft.description || '—' },
    { label: 'Orijinal Fiyat', value: draft.priceOriginal ? formatCurrency(draft.priceOriginal) : '—' },
    { label: 'Müşteri Fiyatı', value: draft.priceDiscounted ? formatCurrency(draft.priceDiscounted) : '—' },
    { label: 'Günlük Adet', value: String(draft.quantityTotal ?? '—') },
    { label: 'Günler', value: dayLabels || '—' },
    { label: 'Teslim Saati', value: draft.pickupStart && draft.pickupEnd ? `${draft.pickupStart}–${draft.pickupEnd}` : '—' },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <PageHeader title="Sürpriz Çanta Oluştur" showBack />

      <div className="px-6 py-4">
        <StepProgress steps={4} current={4} />
        <p className="mt-2 text-xs text-slate-500">Adım 4 / 4 — İncele & Yayınla</p>
      </div>

      <div className="flex flex-1 flex-col px-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Teklif özeti</h2>

        <div className="overflow-hidden rounded-xl border border-slate-100">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`flex justify-between gap-4 px-4 py-3 ${
                i < rows.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <span className="text-sm text-slate-500">{row.label}</span>
              <span className="text-right text-sm font-medium text-slate-900 max-w-[55%]">{row.value}</span>
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-danger-500">{error}</p>}

        <div className="pb-10 pt-6">
          <Button variant="primary" fullWidth loading={loading} onClick={handleSubmit}>
            Sürpriz Çantayı Yayınla 🎉
          </Button>
          <Button
            variant="ghost"
            fullWidth
            className="mt-2"
            onClick={() => navigate('/business/offers/new/schedule')}
          >
            Düzenle
          </Button>
        </div>
      </div>
    </div>
  );
}
