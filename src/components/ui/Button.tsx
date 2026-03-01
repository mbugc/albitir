import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all active:scale-[0.97]',
        size === 'sm' && 'px-4 py-2 text-sm',
        size === 'md' && 'px-6 py-3 text-base',
        size === 'lg' && 'px-8 py-4 text-lg',
        variant === 'primary' && [
          'bg-primary-700 text-white',
          !isDisabled && 'hover:bg-primary-800 active:bg-primary-900',
          isDisabled && 'opacity-50',
        ],
        variant === 'secondary' && [
          'border-2 border-slate-300 bg-white text-slate-700',
          !isDisabled && 'hover:border-slate-400 hover:bg-slate-50',
          isDisabled && 'opacity-50',
        ],
        variant === 'danger' && [
          'bg-danger-500 text-white',
          !isDisabled && 'hover:bg-danger-600',
          isDisabled && 'opacity-50',
        ],
        variant === 'ghost' && [
          'text-slate-700',
          !isDisabled && 'hover:bg-slate-100',
          isDisabled && 'opacity-50',
        ],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
