import { cn } from '@/utils/cn';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
}

export default function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  className,
}: QuantityStepperProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <button
        type="button"
        onClick={() => value > min && onChange(value - 1)}
        disabled={value <= min}
        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-300 text-slate-700 transition-colors hover:border-primary-600 hover:text-primary-700 disabled:opacity-40"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        </svg>
      </button>

      <span className="min-w-[2ch] text-center text-lg font-semibold text-slate-900">{value}</span>

      <button
        type="button"
        onClick={() => value < max && onChange(value + 1)}
        disabled={value >= max}
        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-300 text-slate-700 transition-colors hover:border-primary-600 hover:text-primary-700 disabled:opacity-40"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  );
}
