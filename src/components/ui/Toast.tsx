import { cn } from '@/utils/cn';
import type { ToastItem, ToastType } from '@/hooks/useToast';

interface ToastContainerProps {
  toasts: ToastItem[];
  dismiss: (id: string) => void;
}

function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'success') {
    return (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (type === 'error') {
    return (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function ToastContainer({ toasts, dismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed left-0 right-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismiss(toast.id)}
          className={cn(
            'flex w-full max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-left shadow-lg',
            toast.type === 'success' && 'bg-success-500 text-white',
            toast.type === 'error' && 'bg-danger-500 text-white',
            toast.type === 'info' && 'bg-slate-800 text-white',
          )}
        >
          <ToastIcon type={toast.type} />
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
        </button>
      ))}
    </div>
  );
}
