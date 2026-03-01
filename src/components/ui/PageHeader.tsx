import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  className?: string;
  transparent?: boolean;
}

export default function PageHeader({
  title,
  showBack = false,
  onBack,
  right,
  className,
  transparent = false,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={cn(
        'flex h-14 items-center px-4',
        !transparent && 'border-b border-slate-100 bg-white',
        className,
      )}
    >
      {showBack ? (
        <button
          onClick={handleBack}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      ) : (
        <div className="w-9" />
      )}
      <h1 className="flex-1 text-center text-base font-semibold text-slate-900">{title}</h1>
      <div className="flex w-9 justify-end">{right}</div>
    </header>
  );
}
