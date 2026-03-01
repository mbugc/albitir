import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { getBusinessByOwner } from '@/services/businessService';
import type { Business, BusinessStatus } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/SkeletonLoader';

const STATUS_CONFIG: Record<BusinessStatus, {
  label: string;
  variant: 'warning' | 'primary' | 'success' | 'danger' | 'neutral';
  description: string;
  icon: string;
}> = {
  PENDING_REVIEW: {
    label: 'İnceleme Bekliyor',
    variant: 'warning',
    description: 'Başvurunuz alındı. Ekibimiz bilgilerinizi inceleyecek. Bu işlem genellikle 1-2 iş günü sürer.',
    icon: '⏳',
  },
  IN_REVIEW: {
    label: 'İnceleniyor',
    variant: 'primary',
    description: 'Başvurunuz şu anda inceleniyor. Yakında sonuçlanacak.',
    icon: '🔍',
  },
  APPROVED: {
    label: 'Onaylandı',
    variant: 'success',
    description: 'İşletmeniz onaylandı! Artık sürpriz çanta oluşturabilirsiniz.',
    icon: '✅',
  },
  NEEDS_INFO: {
    label: 'Bilgi Gerekiyor',
    variant: 'warning',
    description: 'Başvurunuz için ek bilgi gerekiyor. Lütfen aşağıdaki notları inceleyin.',
    icon: '📋',
  },
  REJECTED: {
    label: 'Reddedildi',
    variant: 'danger',
    description: 'Başvurunuz maalesef reddedildi. Aşağıdaki notları inceleyerek tekrar başvurabilirsiniz.',
    icon: '❌',
  },
};

export default function ReviewStatusPage() {
  const navigate = useNavigate();
  const { firebaseUser, signOut } = useAuth();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    getBusinessByOwner(firebaseUser.uid).then((biz) => {
      setBusiness(biz);
      setLoading(false);
      if (biz?.status === 'APPROVED') {
        navigate('/business/dashboard', { replace: true });
      }
    });
  }, [firebaseUser, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/business/auth', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-white">
        <PageHeader title="Başvuru Durumu" />
        <div className="space-y-4 p-6">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-dvh bg-white">
        <PageHeader title="Başvuru Durumu" />
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="text-center">
            <p className="text-slate-500">İşletme profili bulunamadı.</p>
            <Button variant="primary" className="mt-4" onClick={() => navigate('/business/signup')}>
              İşletme kaydı yap
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const config = STATUS_CONFIG[business.status];

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <PageHeader title="Başvuru Durumu" />

      <div className="flex flex-1 flex-col px-6 py-6">
        {/* Status card */}
        <div className="rounded-2xl border border-slate-100 p-6 text-center">
          <p className="text-4xl">{config.icon}</p>
          <Badge variant={config.variant} className="mt-3 text-sm">
            {config.label}
          </Badge>
          <h2 className="mt-3 text-lg font-bold text-slate-900">{business.name}</h2>
          <p className="mt-2 text-sm text-slate-500">{config.description}</p>
        </div>

        {/* Review notes */}
        {business.reviewNotes && (business.status === 'NEEDS_INFO' || business.status === 'REJECTED') && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800">Admin notu:</p>
            <p className="mt-1 text-sm text-amber-700">{business.reviewNotes}</p>
          </div>
        )}

        {/* Business info summary */}
        <div className="mt-6 rounded-xl border border-slate-100 overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3">
            <span className="text-xs text-slate-400">İşletme Adı</span>
            <p className="text-sm font-medium text-slate-900">{business.name}</p>
          </div>
          <div className="border-b border-slate-100 px-4 py-3">
            <span className="text-xs text-slate-400">E-posta</span>
            <p className="text-sm font-medium text-slate-900">{business.email}</p>
          </div>
          <div className="border-b border-slate-100 px-4 py-3">
            <span className="text-xs text-slate-400">Adres</span>
            <p className="text-sm font-medium text-slate-900">{business.address.line1}, {business.address.city}</p>
          </div>
          <div className="px-4 py-3">
            <span className="text-xs text-slate-400">IBAN</span>
            <p className="text-sm font-medium text-slate-900">{business.iban || '—'}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto pb-8 pt-6">
          {business.status === 'APPROVED' && (
            <Button variant="primary" fullWidth onClick={() => navigate('/business/dashboard')}>
              Panele git
            </Button>
          )}
          <button
            onClick={handleSignOut}
            className="mt-4 block w-full text-center text-sm text-slate-400"
          >
            Çıkış yap
          </button>
        </div>
      </div>
    </div>
  );
}
