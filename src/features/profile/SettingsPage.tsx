import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [proximityAlerts, setProximityAlerts] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  const handleDeleteAccount = () => {
    // MVP placeholder
    alert('Hesap silme talebi için lütfen destek@albitir.com adresine yazın.');
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      <PageHeader title="Ayarlar" showBack />

      <div className="px-4 py-4">
        {/* Notifications section */}
        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-4">
            <h2 className="text-sm font-bold text-slate-900">Bildirimler</h2>
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Push bildirimler</p>
              <p className="text-xs text-slate-500">Sipariş güncellemeleri</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                notifications ? 'bg-primary-700' : 'bg-slate-300'
              }`}
            >
              <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                notifications ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Yakınlık bildirimleri</p>
              <p className="text-xs text-slate-500">Yakınındaki fırsatlar</p>
            </div>
            <button
              onClick={() => setProximityAlerts(!proximityAlerts)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                proximityAlerts ? 'bg-primary-700' : 'bg-slate-300'
              }`}
            >
              <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                proximityAlerts ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </section>

        {/* Location section */}
        <section className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-4">
            <h2 className="text-sm font-bold text-slate-900">Konum</h2>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm text-slate-600">
              {userProfile?.location?.city ?? 'Konum belirlenmedi'}
            </p>
            {userProfile?.location && (
              <p className="text-xs text-slate-400">
                Arama yarıçapı: {userProfile.location.radiusKm} km
              </p>
            )}
          </div>
        </section>

        {/* Legal section */}
        <section className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-4">
            <h2 className="text-sm font-bold text-slate-900">Yasal</h2>
          </div>
          <button className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left">
            <span className="text-sm text-slate-900">Kullanım Şartları</span>
            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button className="flex w-full items-center justify-between px-4 py-3 text-left">
            <span className="text-sm text-slate-900">Gizlilik Politikası</span>
            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </section>

        {/* Support section */}
        <section className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-4">
            <h2 className="text-sm font-bold text-slate-900">Destek</h2>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm text-slate-600">destek@albitir.com</p>
            <p className="text-xs text-slate-400">Sorularınız için bize ulaşın</p>
          </div>
        </section>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <Button variant="secondary" fullWidth onClick={handleSignOut}>
            Çıkış yap
          </Button>
          <Button variant="danger" fullWidth onClick={handleDeleteAccount}>
            Hesabı sil
          </Button>
        </div>

        <p className="mt-6 pb-6 text-center text-xs text-slate-300">albitir v0.1.0</p>
      </div>
    </div>
  );
}
