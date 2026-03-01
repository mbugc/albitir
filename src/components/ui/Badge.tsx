import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variant === 'primary' && 'bg-primary-100 text-primary-700',
        variant === 'accent' && 'bg-accent-400 text-slate-900',
        variant === 'success' && 'bg-success-500 text-white',
        variant === 'warning' && 'bg-amber-100 text-amber-800',
        variant === 'danger' && 'bg-danger-500 text-white',
        variant === 'neutral' && 'bg-slate-100 text-slate-600',
        className,
      )}
    >
      {children}
    </span>
  );
}
