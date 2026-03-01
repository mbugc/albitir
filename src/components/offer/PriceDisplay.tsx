import { formatCurrency } from '@/utils/formatCurrency';
import { cn } from '@/utils/cn';

interface PriceDisplayProps {
  original: number;
  discounted: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PriceDisplay({
  original,
  discounted,
  currency = 'TRY',
  size = 'md',
  className,
}: PriceDisplayProps) {
  return (
    <div className={cn('flex items-baseline gap-1.5', className)}>
      <span
        className={cn(
          'font-bold text-primary-700',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-xl',
        )}
      >
        {formatCurrency(discounted, currency)}
      </span>
      <span
        className={cn(
          'text-slate-400 line-through',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base',
        )}
      >
        {formatCurrency(original, currency)}
      </span>
    </div>
  );
}
