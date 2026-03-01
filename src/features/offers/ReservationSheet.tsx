import { useState } from 'react';
import type { Offer } from '@/types';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';
import QuantityStepper from '@/components/offer/QuantityStepper';
import { formatCurrency } from '@/utils/formatCurrency';
import { getPickupDateLabel, getNextPickupDate } from '@/utils/formatDate';

interface ReservationSheetProps {
  offer: Offer;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
}

export default function ReservationSheet({ offer, isOpen, onClose, onConfirm }: ReservationSheetProps) {
  const [quantity, setQuantity] = useState(1);

  const subtotal = offer.priceDiscounted * quantity;
  const pickupDate = getNextPickupDate(offer.daysOfWeek);
  const dateLabel = getPickupDateLabel(pickupDate);

  const handleContinue = () => {
    onConfirm(quantity);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="px-4 pb-6 pt-2">
        {/* Offer info */}
        <div className="mb-4 rounded-xl bg-slate-50 px-4 py-3">
          <p className="font-semibold text-slate-900">{offer.businessName}</p>
          <p className="text-sm text-slate-500">{offer.title}</p>
          <p className="mt-1 text-xs text-primary-700">
            {dateLabel} · {offer.pickupStart}–{offer.pickupEnd}
          </p>
        </div>

        {/* Quantity */}
        <div className="mb-4 flex items-center justify-between">
          <p className="font-semibold text-slate-900">Adet</p>
          <QuantityStepper
            value={quantity}
            min={1}
            max={Math.min(offer.quantityAvailable, 5)}
            onChange={setQuantity}
          />
        </div>

        {/* Price preview */}
        <div className="mb-4 rounded-xl border border-slate-100 p-4">
          <div className="flex justify-between text-sm text-slate-600">
            <span>{quantity} adet × {formatCurrency(offer.priceDiscounted)}</span>
            <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">KDV ve kredi indirimi sonraki adımda hesaplanır.</p>
        </div>

        <Button variant="primary" fullWidth onClick={handleContinue}>
          Devam et · {formatCurrency(subtotal)}
        </Button>
      </div>
    </BottomSheet>
  );
}
