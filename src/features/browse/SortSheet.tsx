import BottomSheet from '@/components/ui/BottomSheet';
import type { SortOption } from '@/types';
import { cn } from '@/utils/cn';

const OPTIONS: { value: SortOption; label: string; description: string }[] = [
  { value: 'relevance', label: 'İlgililik', description: 'En alakalı teklifler' },
  { value: 'price', label: 'Fiyat', description: 'En düşükten yükseğe' },
  { value: 'rating', label: 'Puan', description: 'En yüksek puanlılar önce' },
];

interface SortSheetProps {
  isOpen: boolean;
  current: SortOption;
  onClose: () => void;
  onChange: (sort: SortOption) => void;
}

export default function SortSheet({ isOpen, current, onClose, onChange }: SortSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Sırala">
      <div className="px-4 py-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { onChange(opt.value); onClose(); }}
            className={cn(
              'flex w-full items-center justify-between rounded-xl px-4 py-4 text-left transition-colors',
              current === opt.value ? 'bg-primary-50' : 'hover:bg-slate-50',
            )}
          >
            <div>
              <p className={cn(
                'font-semibold',
                current === opt.value ? 'text-primary-700' : 'text-slate-900',
              )}>
                {opt.label}
              </p>
              <p className="text-sm text-slate-500">{opt.description}</p>
            </div>
            {current === opt.value && (
              <svg className="h-5 w-5 text-primary-700" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
