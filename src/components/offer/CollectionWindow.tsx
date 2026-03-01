import { cn } from '@/utils/cn';
import { getPickupDateLabel } from '@/utils/formatDate';

interface CollectionWindowProps {
  pickupStart: string; // "17:00"
  pickupEnd: string;   // "19:00"
  pickupDate?: string; // ISO date "2026-02-26"
  size?: 'sm' | 'md';
  className?: string;
}

export default function CollectionWindow({
  pickupStart,
  pickupEnd,
  pickupDate,
  size = 'sm',
  className,
}: CollectionWindowProps) {
  const dateLabel = pickupDate ? getPickupDateLabel(pickupDate) : null;
  const showLabel = dateLabel && dateLabel !== 'Past';

  return (
    <div className={cn('flex items-center gap-1.5 text-slate-500', className)}>
      <svg
        className={cn(size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span className={cn('font-medium', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {showLabel && <span className="text-primary-700">{dateLabel} · </span>}
        {pickupStart}–{pickupEnd}
      </span>
    </div>
  );
}
