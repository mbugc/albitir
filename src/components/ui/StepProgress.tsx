import { cn } from '@/utils/cn';

interface StepProgressProps {
  steps: number;
  current: number; // 1-based
}

export default function StepProgress({ steps, current }: StepProgressProps) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: steps }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors',
            i < current ? 'bg-primary-700' : 'bg-slate-200',
          )}
        />
      ))}
    </div>
  );
}
