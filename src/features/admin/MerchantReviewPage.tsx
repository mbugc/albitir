import { useState, useEffect } from 'react';
import { getAllBusinesses, updateBusinessStatus } from '@/services/adminService';
import type { Business, BusinessStatus } from '@/types';
import { BUSINESS_CATEGORY_LABELS } from '@/types';
import Badge from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/SkeletonLoader';

const STATUS_LABELS: Record<BusinessStatus, string> = {
  PENDING_REVIEW: 'Beklemede',
  IN_REVIEW: 'İnceleniyor',
  APPROVED: 'Onaylı',
  NEEDS_INFO: 'Bilgi Gerekli',
  REJECTED: 'Reddedildi',
};

const STATUS_VARIANT: Record<BusinessStatus, BadgeVariant> = {
  PENDING_REVIEW: 'warning',
  IN_REVIEW: 'primary',
  APPROVED: 'success',
  NEEDS_INFO: 'warning',
  REJECTED: 'danger',
};

type FilterKey = 'all' | 'pending' | 'approved' | 'rejected';

export default function MerchantReviewPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    getAllBusinesses().then((data) => {
      setBusinesses(data);
      setLoading(false);
    });
  }, []);

  const filtered = businesses.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return b.status === 'PENDING_REVIEW' || b.status === 'IN_REVIEW' || b.status === 'NEEDS_INFO';
    if (filter === 'approved') return b.status === 'APPROVED';
    if (filter === 'rejected') return b.status === 'REJECTED';
    return true;
  });

  const handleAction = async (businessId: string, status: BusinessStatus) => {
    setActionLoading(true);
    try {
      await updateBusinessStatus(businessId, status, notes.trim() || undefined);
      setBusinesses((prev) =>
        prev.map((b) => (b.id === businessId ? { ...b, status, reviewNotes: notes.trim() || b.reviewNotes } : b)),
      );
      setSelectedId(null);
      setNotes('');
    } catch {
      // silently handle for MVP
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">İşletme İncelemeleri</h1>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2">
        {(
          [
            { key: 'pending', label: 'Bekleyen' },
            { key: 'approved', label: 'Onaylı' },
            { key: 'rejected', label: 'Reddedilen' },
            { key: 'all', label: 'Tümü' },
          ] as { key: FilterKey; label: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.key ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Business list */}
      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500">Bu kategoride işletme yok.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((business) => (
            <div key={business.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{business.name}</h3>
                    <Badge variant={STATUS_VARIANT[business.status]}>
                      {STATUS_LABELS[business.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{business.email}</p>
                  <p className="text-sm text-slate-500">{business.phone}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {BUSINESS_CATEGORY_LABELS[business.category]} · {business.address.line1}, {business.address.city}
                  </p>
                  {business.iban && (
                    <p className="mt-1 text-xs text-slate-400">IBAN: {business.iban}</p>
                  )}
                  {business.reviewNotes && (
                    <p className="mt-2 text-xs italic text-amber-600">Not: {business.reviewNotes}</p>
                  )}
                </div>

                {business.status !== 'APPROVED' && business.status !== 'REJECTED' && (
                  <button
                    onClick={() => setSelectedId(selectedId === business.id ? null : business.id)}
                    className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    {selectedId === business.id ? 'Kapat' : 'İşlem'}
                  </button>
                )}
              </div>

              {/* Action panel */}
              {selectedId === business.id && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Admin notu (opsiyonel)"
                    rows={2}
                    className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      loading={actionLoading}
                      onClick={() => handleAction(business.id, 'APPROVED')}
                    >
                      Onayla
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={actionLoading}
                      onClick={() => handleAction(business.id, 'REJECTED')}
                    >
                      Reddet
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={actionLoading}
                      onClick={() => handleAction(business.id, 'NEEDS_INFO')}
                    >
                      Bilgi İste
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
