import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import type { Order } from '@/types';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatCurrency';
import { getPickupDateLabel } from '@/utils/formatDate';

export default function OrderConfirmPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = (location.state as { order?: Order } | null)?.order;

  if (!order) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4 text-center">
        <div>
          <p className="text-slate-500">Sipariş bilgisi bulunamadı.</p>
          <Button className="mt-4" onClick={() => navigate('/orders')}>
            Siparişlerim
          </Button>
        </div>
      </div>
    );
  }

  const dateLabel = getPickupDateLabel(order.pickupDate);

  return (
    <div className="flex min-h-dvh flex-col bg-white px-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {/* Success icon */}
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success-500 text-5xl text-white">
          ✓
        </div>

        <h1 className="text-2xl font-black text-slate-900">Sipariş Tamam!</h1>
        <p className="mt-2 text-slate-500">
          {order.businessName} · {order.offerTitle}
        </p>

        {/* Order number */}
        {order.orderNumber && (
          <p className="mt-2 text-lg font-bold text-primary-700">{order.orderNumber}</p>
        )}

        {/* Pickup code */}
        <div className="mt-8 w-full rounded-2xl bg-primary-50 px-6 py-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary-600">
            Teslim Alma Kodu
          </p>
          <p className="font-mono text-5xl font-black tracking-[0.3em] text-primary-700">
            {order.pickupCode}
          </p>
          <div className="mx-auto mt-3 inline-block rounded-xl bg-white p-3">
            <QRCodeSVG value={`albitir://order/${order.id}/pickup/${order.pickupCode}`} size={120} />
          </div>
          <p className="mt-2 text-xs text-primary-500">
            Mağazada bu kodu göster
          </p>
        </div>

        {/* Collection info */}
        <div className="mt-6 w-full rounded-xl border border-slate-100 p-4 text-left">
          <div className="flex justify-between py-1 text-sm">
            <span className="text-slate-500">Teslim alma zamanı</span>
            <span className="font-semibold text-slate-900">
              {dateLabel} · {order.pickupStart}–{order.pickupEnd}
            </span>
          </div>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-slate-500">Toplam ödenen</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-left">
          <p className="text-sm font-semibold text-slate-700">Sonraki adımlar</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-500">
            <li>• Belirlenen saatte mağazaya git</li>
            <li>• Teslim alma kodunu göster</li>
            <li>• Sürpriz çantanı al ve keyif çıkar!</li>
          </ul>
        </div>
      </div>

      <div className="pb-10 pt-6">
        <Button
          variant="primary"
          fullWidth
          onClick={() => navigate('/orders')}
        >
          Siparişlerimi gör
        </Button>
        <Button
          variant="ghost"
          fullWidth
          className="mt-2"
          onClick={() => navigate('/discover')}
        >
          Ana sayfaya dön
        </Button>
      </div>
    </div>
  );
}
