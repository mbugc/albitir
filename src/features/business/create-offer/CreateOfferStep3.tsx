import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveDraft, loadDraft } from './offerDraft';
import { DAYS_OF_WEEK } from '@/types';
import Button from '@/components/ui/Button';
import StepProgress from '@/components/ui/StepProgress';
import PageHeader from '@/components/ui/PageHeader';
import { cn } from '@/utils/cn';

const QTY_OPTIONS = [2, 3, 4, 5];

export default function CreateOfferStep3() {
  const navigate = useNavigate();
  const draft = loadDraft();

  const [quantity, setQuantity] = useState(draft.quantityTotal ?? 3);
  const [customQty, setCustomQty] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [days, setDays] = useState<number[]>(draft.daysOfWeek ?? [1, 2, 3, 4, 5]);
  const [pickupStart, setPickupStart] = useState(draft.pickupStart ?? '17:00');
  const [pickupEnd, setPickupEnd] = useState(draft.pickupEnd ?? '19:00');
  const [error, setError] = useState('');

  const toggleDay = (d: number) =>
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b));

  const handleNext = () => {
    const qty = useCustom ? parseInt(customQty) : quantity;
    if (!qty || qty < 1 || qty > 99) { setError('Geçerli bir adet girin (1-99).'); return; }
    if (days.length === 0) { setError('En az bir gün seçin.'); return; }
    if (!pickupStart || !pickupEnd) { setError('Teslim alma saatlerini girin.'); return; }
    saveDraft({ quantityTotal: qty, daysOfWeek: days, pickupStart, pickupEnd });
    navigate('/business/offers/new/review');
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <PageHeader title="Sürpriz Çanta Oluştur" showBack />

      <div className="px-6 py-4">
        <StepProgress steps={4} current={3} />
        <p className="mt-2 text-xs text-slate-500">Adım 3 / 4 — Program</p>
      </div>

      <div className="flex flex-1 flex-col px-6">
        <div className="flex flex-col gap-6">
          {/* Quantity */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Günlük adet</label>
            <div className="flex gap-2 flex-wrap">
              {QTY_OPTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => { setQuantity(q); setUseCustom(false); }}
                  className={cn(
                    'rounded-xl border px-4 py-2 text-sm font-semibold transition-colors',
                    !useCustom && quantity === q
                      ? 'border-primary-700 bg-primary-50 text-primary-700'
                      : 'border-slate-200 text-slate-700'
                  )}
                >
                  {q}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setUseCustom(true)}
                className={cn(
                  'rounded-xl border px-4 py-2 text-sm font-semibold transition-colors',
                  useCustom ? 'border-primary-700 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-700'
                )}
              >
                Özel
              </button>
            </div>
            {useCustom && (
              <input
                type="number"
                value={customQty}
                onChange={(e) => setCustomQty(e.target.value)}
                placeholder="Adet girin"
                min="1"
                max="99"
                className="mt-2 w-28 rounded-xl border border-slate-300 px-3 py-2 text-base outline-none focus:border-primary-600"
              />
            )}
          </div>

          {/* Days of week */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Günler</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={cn(
                    'rounded-xl border px-3 py-2 text-sm font-semibold transition-colors',
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

          {/* Collection window */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Teslim alma saatleri</label>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={pickupStart}
                onChange={(e) => setPickupStart(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-base outline-none focus:border-primary-600"
              />
              <span className="text-slate-500">–</span>
              <input
                type="time"
                value={pickupEnd}
                onChange={(e) => setPickupEnd(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-base outline-none focus:border-primary-600"
              />
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-danger-500">{error}</p>}

        <div className="pb-10 pt-6">
          <Button variant="primary" fullWidth onClick={handleNext}>İncele</Button>
        </div>
      </div>
    </div>
  );
}
