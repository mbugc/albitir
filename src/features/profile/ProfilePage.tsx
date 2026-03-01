import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  const initials = userProfile?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="bg-white px-4 pb-6 pt-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-700 text-xl font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{userProfile?.name ?? '...'}</p>
            <p className="text-sm text-slate-500">{userProfile?.email ?? ''}</p>
          </div>
        </div>
      </header>

      {/* Wallet balance */}
      {(userProfile?.walletBalance ?? 0) > 0 && (
        <div className="mx-4 mt-4 rounded-xl bg-primary-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <svg className="h-5 w-5 text-primary-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 6v3" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-primary-700">Bakiye</p>
              <p className="text-lg font-bold text-primary-900">
                {((userProfile?.walletBalance ?? 0) / 100).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Impact stats */}
      <div className="mx-4 mt-4 rounded-xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          Etkin
        </p>
        <div className="grid grid-cols-3 divide-x divide-slate-100">
          {[
            { label: 'Tasarruf', value: '₺0' },
            { label: 'Öğün', value: '0' },
            { label: 'CO₂', value: '0 kg' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center py-2">
              <p className="text-xl font-black text-primary-700">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="mx-4 mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
        <button
          onClick={() => navigate('/orders')}
          className="flex w-full items-center justify-between px-4 py-4 text-left active:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-medium text-slate-900">Siparişlerim</span>
          </div>
          <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <div className="mx-4 h-px bg-slate-100" />

        <button
          onClick={() => navigate('/business/auth')}
          className="flex w-full items-center justify-between px-4 py-4 text-left active:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
            </svg>
            <span className="font-medium text-slate-900">İşletme paneli</span>
          </div>
          <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Settings link */}
      <div className="mx-4 mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
        <button
          onClick={() => navigate('/settings')}
          className="flex w-full items-center justify-between px-4 py-4 text-left active:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium text-slate-900">Ayarlar</span>
          </div>
          <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <div className="mx-4 mt-4">
        <Button variant="secondary" fullWidth onClick={handleSignOut}>
          Çıkış yap
        </Button>
      </div>

      <p className="mt-8 pb-6 text-center text-xs text-slate-300">albitir v0.1.0</p>
    </div>
  );
}
