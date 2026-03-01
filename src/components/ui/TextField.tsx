import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  onClear?: () => void;
}

export default function TextField({
  label,
  error,
  onClear,
  value,
  className,
  id,
  ...props
}: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          value={value}
          className={cn(
            'w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400',
            'outline-none transition-colors',
            'focus:border-primary-600 focus:ring-2 focus:ring-primary-100',
            error ? 'border-danger-500' : 'border-slate-300',
            onClear && value && 'pr-10',
            className,
          )}
          {...props}
        />
        {onClear && value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {error && <p className="text-sm text-danger-500">{error}</p>}
    </div>
  );
}
