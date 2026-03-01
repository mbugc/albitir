import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '@/services/authService';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import PageHeader from '@/components/ui/PageHeader';

function getResetErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Geçerli bir e-posta girin.';
    case 'auth/user-not-found':
      return 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.';
    case 'auth/too-many-requests':
      return 'Çok fazla deneme. Biraz bekleyin.';
    default:
      return 'Bir hata oluştu, tekrar deneyin.';
  }
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Geçerli bir e-posta girin.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError(getResetErrorMessage((err as any)?.code ?? ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <PageHeader title="Şifremi Unuttum" showBack />

      <div className="flex flex-1 flex-col px-6 pt-8">
        {sent ? (
          <div className="flex flex-col items-center gap-6 pt-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-3xl">
              ✉️
            </div>
            <p className="text-sm text-slate-600">
              Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/auth/consumer')}
            >
              Giriş Sayfasına Dön
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-slate-500">
              Kayıtlı e-posta adresini gir, şifre sıfırlama bağlantısı gönderelim.
            </p>
            <TextField
              label="E-posta"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              autoComplete="email"
              autoFocus
              error={error}
            />
            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Sıfırlama Bağlantısı Gönder
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
