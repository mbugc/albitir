import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { getBusinessByOwner } from '@/services/businessService';
import { auth } from '@/services/firebase';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';

function getAuthError(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'E-posta veya şifre hatalı.';
    case 'auth/wrong-password':
      return 'Şifre hatalı.';
    case 'auth/too-many-requests':
      return 'Çok fazla deneme. Bekleyin.';
    default:
      return 'Bir hata oluştu.';
  }
}

export default function BusinessAuthPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      const uid = auth.currentUser?.uid;
      if (uid) {
        const business = await getBusinessByOwner(uid);
        if (!business) {
          navigate('/business/signup', { replace: true });
        } else if (business.status === 'APPROVED') {
          navigate('/business/dashboard', { replace: true });
        } else {
          navigate('/business/review-status', { replace: true });
        }
      }
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError(getAuthError((e as any)?.code ?? ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div className="bg-primary-700 px-6 pb-8 pt-10 text-white">
        <h1 className="text-2xl font-black">albitir İşletme</h1>
        <p className="mt-1 text-sm text-primary-200">Surplus yiyeceklerinizi listeyin</p>
      </div>

      <div className="flex flex-1 flex-col px-6 pt-8">
        <h2 className="mb-6 text-xl font-bold text-slate-900">İşletme girişi</h2>

        <form onSubmit={handleSignIn} className="flex flex-col gap-4">
          <TextField
            label="E-posta"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="isletme@email.com"
            autoComplete="email"
          />
          <TextField
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifreniz"
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-danger-500">{error}</p>}
          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Giriş yap
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">İşletmeniz henüz kayıtlı değil mi?</p>
          <button
            onClick={() => navigate('/business/signup')}
            className="mt-1 text-sm font-semibold text-primary-700"
          >
            İşletmenizi kaydedin →
          </button>
        </div>

        <button
          onClick={() => navigate('/auth')}
          className="mt-auto pb-8 pt-4 text-center text-sm text-slate-400"
        >
          Müşteri girişine dön
        </button>
      </div>
    </div>
  );
}
