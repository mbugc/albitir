import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-200', className)} />;
}

export function OfferCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

interface SkeletonLoaderProps {
  count?: number;
  columns?: 1 | 2;
}

export default function SkeletonLoader({ count = 4, columns = 2 }: SkeletonLoaderProps) {
  return (
    <div
      className={cn(
        'grid gap-3 p-4',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-2',
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <OfferCardSkeleton key={i} />
      ))}
    </div>
  );
}
