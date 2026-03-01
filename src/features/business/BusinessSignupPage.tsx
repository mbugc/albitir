import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { createBusiness } from '@/services/businessService';
import { signUpWithEmail } from '@/services/authService';
import { BUSINESS_CATEGORY_LABELS, SURPLUS_CATEGORY_LABELS } from '@/types';
import type { Business } from '@/types';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import StepProgress from '@/components/ui/StepProgress';
import PageHeader from '@/components/ui/PageHeader';

type Step = 1 | 2 | 3;

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  category: Business['category'];
  surplusCategory: Business['surplusCategory'];
  addressLine1: string;
  addressCity: string;
  addressPostalCode: string;
  iban: string;
}

const INITIAL: FormData = {
  name: '',
  email: '',
  phone: '',
  password: '',
  category: 'restaurant',
  surplusCategory: 'meals',
  addressLine1: '',
  addressCity: 'Istanbul',
  addressPostalCode: '',
  iban: '',
};

export default function BusinessSignupPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const validateStep = (): boolean => {
    setError('');
    if (step === 1) {
      if (!form.name.trim()) { setError('İşletme adı zorunlu.'); return false; }
      if (!form.email.includes('@')) { setError('Geçerli e-posta girin.'); return false; }
      if (form.password.length < 6) { setError('Şifre en az 6 karakter.'); return false; }
    }
    if (step === 2) {
      if (!form.addressLine1.trim()) { setError('Adres zorunlu.'); return false; }
      if (!form.addressCity.trim()) { setError('Şehir zorunlu.'); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => (s < 3 ? (s + 1) as Step : s));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError('');
    try {
      const { user } = await signUpWithEmail(form.email, form.password);
      await refreshProfile();
      await createBusiness({
        ownerId: user.uid,
        name: form.name.trim(),
        email: form.email,
        phone: form.phone,
        country: 'TR',
        category: form.category,
        surplusCategory: form.surplusCategory,
        address: {
          line1: form.addressLine1,
          city: form.addressCity,
          postalCode: form.addressPostalCode || undefined,
          country: 'TR',
        },
        iban: form.iban.trim() || undefined,
      });
      navigate('/business/review-status', { replace: true });
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const code = (e as any)?.code ?? '';
      if (code === 'auth/email-already-in-use') {
        setError('Bu e-posta zaten kayıtlı. İşletme girişi yapın.');
      } else {
        setError('Kayıt sırasında hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['İşletme bilgileri', 'Konum', 'IBAN & Belgeler'];

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <PageHeader
        title="İşletme Kaydı"
        showBack
        onBack={() => {
          if (step > 1) setStep((s) => (s - 1) as Step);
          else navigate(-1);
        }}
      />

      <div className="px-6 py-4">
        <StepProgress steps={3} current={step} />
        <p className="mt-2 text-xs text-slate-500">Adım {step} / 3 — {stepLabels[step - 1]}</p>
      </div>

      <div className="flex flex-1 flex-col px-6">
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-900">İşletme bilgileri</h2>
            <TextField label="İşletme Adı" value={form.name} onChange={set('name')} placeholder="Örn: Lezzet Fırını" />
            <TextField label="E-posta" type="email" value={form.email} onChange={set('email')} placeholder="isletme@email.com" autoComplete="email" />
            <TextField label="Telefon" type="tel" value={form.phone} onChange={set('phone')} placeholder="+90 555 000 0000" />
            <TextField label="Şifre" type="password" value={form.password} onChange={set('password')} placeholder="En az 6 karakter" autoComplete="new-password" />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">İşletme Türü</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(BUSINESS_CATEGORY_LABELS) as [Business['category'], string][]).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: val }))}
                    className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                      form.category === val
                        ? 'border-primary-700 bg-primary-50 text-primary-700'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Fazla Yiyecek Türü</label>
              <div className="flex flex-col gap-2">
                {(Object.entries(SURPLUS_CATEGORY_LABELS) as [Business['surplusCategory'], string][]).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, surplusCategory: val }))}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                      form.surplusCategory === val
                        ? 'border-primary-700 bg-primary-50 text-primary-700'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-900">Konum</h2>
            <TextField label="Adres" value={form.addressLine1} onChange={set('addressLine1')} placeholder="Cadde / Sokak / No" />
            <TextField label="Şehir" value={form.addressCity} onChange={set('addressCity')} placeholder="İstanbul" />
            <TextField label="Posta Kodu (opsiyonel)" value={form.addressPostalCode} onChange={set('addressPostalCode')} placeholder="34000" />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-900">IBAN & Belgeler</h2>
            <TextField
              label="IBAN (opsiyonel)"
              value={form.iban}
              onChange={set('iban')}
              placeholder="TR00 0000 0000 0000 0000 0000 00"
            />
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
              <svg className="mx-auto h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.025 3.75 3.75 0 013.55 5.3H18a3 3 0 01-3 3H6.75z" />
              </svg>
              <p className="mt-2 text-sm text-slate-500">Belge yükleme (vergi levhası vb.)</p>
              <p className="text-xs text-slate-400">Yakında eklenecek — şimdilik kaydı tamamlayabilirsiniz.</p>
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-danger-500">{error}</p>}

        <div className="pb-10 pt-6">
          {step < 3 ? (
            <Button variant="primary" fullWidth onClick={handleNext}>Devam et</Button>
          ) : (
            <Button variant="primary" fullWidth loading={loading} onClick={handleSubmit}>
              Başvuruyu gönder
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
