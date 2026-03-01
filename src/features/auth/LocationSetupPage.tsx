import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { updateUserLocation } from '@/services/userService';
import { TURKISH_CITIES } from '@/types';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';

export default function LocationSetupPage() {
  const navigate = useNavigate();
  const { firebaseUser, refreshProfile } = useAuth();

  const [cityIndex, setCityIndex] = useState(0);
  const [radius, setRadius] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const city = TURKISH_CITIES[cityIndex];

  const handleSubmit = async () => {
    if (!firebaseUser) { setError('Oturum bulunamadı.'); return; }
    setLoading(true);
    setError('');
    try {
      await updateUserLocation(firebaseUser.uid, {
        city: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
        radiusKm: radius,
      });
      await refreshProfile();
      navigate('/discover', { replace: true });
    } catch {
      setError('Konum kaydedilirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <PageHeader title="Konumunu seç" showBack />

      <div className="flex flex-1 flex-col px-6 pt-8">
        <p className="mb-6 text-sm text-slate-500">
          Yakındaki süpriz çantaları görmek için şehrini seç.
        </p>

        <div className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Şehir</label>
            <select
              value={cityIndex}
              onChange={(e) => setCityIndex(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
            >
              {TURKISH_CITIES.map((c, i) => (
                <option key={c.name} value={i}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Arama yarıçapı</label>
              <span className="text-sm font-semibold text-primary-700">{radius} km</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-primary-700"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>

          <div className="rounded-xl bg-primary-50 px-4 py-3">
            <p className="text-sm text-primary-700">
              <span className="font-semibold">{city.name}</span> merkezli{' '}
              <span className="font-semibold">{radius} km</span> yarıçap gösterilecek.
            </p>
          </div>

          {error && <p className="text-sm text-danger-500">{error}</p>}

          <Button variant="primary" fullWidth loading={loading} onClick={handleSubmit}>
            Keşfetmeye başla 🎉
          </Button>
        </div>
      </div>
    </div>
  );
}
