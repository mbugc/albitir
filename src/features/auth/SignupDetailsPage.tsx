import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { createUser } from '@/services/userService';
import { grantSignupBonus } from '@/services/walletService';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import PageHeader from '@/components/ui/PageHeader';

export default function SignupDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { firebaseUser, refreshProfile } = useAuth();

  const googleName = (location.state as { googleName?: string } | null)?.googleName ?? '';
  const [name, setName] = useState(googleName);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('İsim zorunludur.'); return; }
    if (!terms) { setError('Kullanım koşullarını kabul etmelisiniz.'); return; }
    if (!firebaseUser) { setError('Oturum bulunamadı.'); return; }

    setLoading(true);
    setError('');
    try {
      await createUser(firebaseUser.uid, {
        email: firebaseUser.email ?? '',
        name: name.trim(),
        country: 'TR',
      });
      await grantSignupBonus(firebaseUser.uid);
      await refreshProfile();
      navigate('/auth/location', { replace: true });
    } catch {
      setError('Hesap oluşturulurken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <PageHeader title="Seni tanıyalım" showBack />

      <div className="flex flex-1 flex-col px-6 pt-8">
        <p className="mb-6 text-sm text-slate-500">Albitir'e hoş geldin! Seni nasıl çağıralım?</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Adın"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adın Soyadın"
            autoFocus
          />

          <div className="rounded-xl border border-slate-200 px-4 py-3">
            <p className="mb-1 text-xs text-slate-500">Ülke</p>
            <p className="font-medium text-slate-900">🇹🇷 Türkiye</p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded accent-primary-700"
            />
            <span className="text-sm text-slate-600">
              <span className="font-semibold text-primary-700">Kullanım Koşulları</span> ve{' '}
              <span className="font-semibold text-primary-700">Gizlilik Politikası</span>'nı
              kabul ediyorum.
            </span>
          </label>

          {error && <p className="text-sm text-danger-500">{error}</p>}

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Devam et
          </Button>
        </form>
      </div>
    </div>
  );
}
