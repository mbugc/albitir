import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { isAdmin } from '@/services/adminService';
import { auth } from '@/services/firebase';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('Giriş başarısız.');

      const admin = await isAdmin(uid);
      if (!admin) {
        setError('Yetkiniz yok. Admin hesabı gereklidir.');
        return;
      }

      navigate('/admin/dashboard', { replace: true });
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const code = (e as any)?.code ?? '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError('E-posta veya şifre hatalı.');
      } else if (!error) {
        setError('Bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-black text-primary-700">albitir</h1>
          <p className="mt-1 text-sm text-slate-500">Admin paneli giriş</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <TextField
            label="E-posta"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@albitir.com"
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
      </div>
    </div>
  );
}
