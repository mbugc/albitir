import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveDraft, loadDraft } from './offerDraft';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import StepProgress from '@/components/ui/StepProgress';
import PageHeader from '@/components/ui/PageHeader';

export default function CreateOfferStep1() {
  const navigate = useNavigate();
  const draft = loadDraft();

  const [title, setTitle] = useState(draft.title ?? '');
  const [description, setDescription] = useState(draft.description ?? '');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!title.trim()) { setError('İsim zorunludur.'); return; }
    if (title.length > 40) { setError('İsim en fazla 40 karakter.'); return; }
    saveDraft({ title: title.trim(), description: description.trim() });
    navigate('/business/offers/new/pricing');
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <PageHeader title="Sürpriz Çanta Oluştur" showBack onBack={() => navigate('/business/dashboard')} />

      <div className="px-6 py-4">
        <StepProgress steps={4} current={1} />
        <p className="mt-2 text-xs text-slate-500">Adım 1 / 4 — İsim & Açıklama</p>
      </div>

      <div className="flex flex-1 flex-col px-6">
        <div className="flex flex-col gap-4">
          <div>
            <TextField
              label="Çanta İsmi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Fırın Sürpriz Çantası"
              maxLength={40}
            />
            <p className="mt-1 text-right text-xs text-slate-400">{title.length}/40</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Açıklama <span className="text-slate-400">(opsiyonel)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Müşterinin ne alabileceğini açıklayın..."
              maxLength={200}
              rows={4}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
            />
            <p className="mt-1 text-right text-xs text-slate-400">{description.length}/200</p>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-danger-500">{error}</p>}

        <div className="pb-10 pt-6">
          <Button variant="primary" fullWidth onClick={handleNext}>Devam et</Button>
        </div>
      </div>
    </div>
  );
}
