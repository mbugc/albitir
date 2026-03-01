import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getUser } from '@/services/userService';
import { auth } from '@/services/firebase';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import PageHeader from '@/components/ui/PageHeader';

type Step = 'email' | 'password';
type Mode = 'signin' | 'signup';

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'E-posta veya şifre hatalı.';
    case 'auth/wrong-password':
      return 'Şifre hatalı.';
    case 'auth/email-already-in-use':
      return 'Bu e-posta zaten kayıtlı.';
    case 'auth/weak-password':
      return 'Şifre en az 6 karakter olmalı.';
    case 'auth/invalid-email':
      return 'Geçerli bir e-posta girin.';
    case 'auth/too-many-requests':
      return 'Çok fazla deneme. Biraz bekleyin.';
    default:
      return 'Bir hata oluştu, tekrar deneyin.';
  }
}

export default function EmailAuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Geçerli bir e-posta girin.');
      return;
    }
    setError('');
    setStep('password');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (mode === 'signin') {
        await signIn(email, password);
        const uid = auth.currentUser?.uid;
        if (uid) {
          const profile = await getUser(uid);
          navigate(profile ? '/discover' : '/auth/signup', { replace: true });
        }
      } else {
        await signUp(email, password);
        navigate('/auth/signup', { replace: true });
      }
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError(getAuthErrorMessage((e as any)?.code ?? ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <PageHeader
        title={step === 'email' ? 'E-posta ile giriş' : mode === 'signin' ? 'Hoş geldin!' : 'Hesap oluştur'}
        showBack
        onBack={() => {
          if (step === 'password') { setStep('email'); setError(''); }
          else navigate(-1);
        }}
      />

      <div className="flex flex-1 flex-col px-6 pt-8">
        {step === 'email' ? (
          <form onSubmit={handleEmailContinue} className="flex flex-col gap-4">
            <p className="text-sm text-slate-500">E-posta adresinle devam et.</p>
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
            <Button type="submit" variant="primary" fullWidth>Devam et</Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-slate-500">
              {email}{' '}
              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); }}
                className="font-medium text-primary-700"
              >
                Değiştir
              </button>
            </p>

            <div className="flex rounded-xl border border-slate-200 p-1">
              {(['signin', 'signup'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(''); }}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                    mode === m ? 'bg-primary-700 text-white' : 'text-slate-500'
                  }`}
                >
                  {m === 'signin' ? 'Giriş yap' : 'Kayıt ol'}
                </button>
              ))}
            </div>

            <TextField
              label="Şifre"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 6 karakter"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              autoFocus
              error={error}
            />

            {mode === 'signin' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/auth/forgot-password')}
                  className="text-sm font-medium text-primary-700"
                >
                  Şifremi unuttum
                </button>
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              {mode === 'signin' ? 'Giriş yap' : 'Hesap oluştur'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
