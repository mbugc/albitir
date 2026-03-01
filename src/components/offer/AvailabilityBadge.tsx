import { cn } from '@/utils/cn';
import type { InventoryStatus } from '@/types';

interface AvailabilityBadgeProps {
  status: InventoryStatus;
  isNew?: boolean;
  className?: string;
}

export default function AvailabilityBadge({ status, isNew, className }: AvailabilityBadgeProps) {
  if (status.type === 'soldOut') {
    return (
      <span className={cn('rounded-full bg-slate-400 px-2.5 py-1 text-xs font-bold text-white', className)}>
        Sold out
      </span>
    );
  }

  if (isNew) {
    return (
      <span className={cn('rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-900 shadow-sm', className)}>
        NEW
      </span>
    );
  }

  return (
    <span className={cn('rounded-full bg-accent-400 px-2.5 py-1 text-xs font-bold text-slate-900', className)}>
      {status.count} left
    </span>
  );
}
