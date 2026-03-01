import { cn } from '@/utils/cn';

interface RatingDisplayProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export default function RatingDisplay({ rating, count, size = 'sm', className }: RatingDisplayProps) {
  if (rating === 0) return null;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <svg
        className={cn('text-accent-500', size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className={cn('font-medium text-slate-700', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {rating.toFixed(1)}
      </span>
      {count !== undefined && count > 0 && (
        <span className={cn('text-slate-400', size === 'sm' ? 'text-xs' : 'text-sm')}>({count})</span>
      )}
    </div>
  );
}
