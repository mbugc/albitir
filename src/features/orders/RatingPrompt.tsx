import { useState } from 'react';
import { rateOrder } from '@/services/orderService';
import Button from '@/components/ui/Button';

interface RatingPromptProps {
  orderId: string;
  onDone: () => void;
}

export default function RatingPrompt({ orderId, onDone }: RatingPromptProps) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (stars === 0) return;
    setLoading(true);
    try {
      await rateOrder(orderId, stars, comment.trim() || undefined);
      onDone();
    } catch {
      // silently fail for MVP
      onDone();
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="text-center text-lg font-bold text-slate-900">Nasıldı?</h3>
      <p className="mt-1 text-center text-sm text-slate-500">Deneyimini puanla</p>

      {/* Stars */}
      <div className="mt-4 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setStars(n)}
            className="text-3xl transition-transform active:scale-110"
          >
            {n <= stars ? (
              <svg className="h-10 w-10 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-10 w-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Comment */}
      {stars > 0 && (
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Yorum ekle (opsiyonel)"
          maxLength={300}
          rows={3}
          className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      )}

      {/* Buttons */}
      <div className="mt-4 flex gap-3">
        <Button variant="ghost" fullWidth onClick={onDone}>
          Geç
        </Button>
        <Button
          variant="primary"
          fullWidth
          loading={loading}
          disabled={stars === 0}
          onClick={handleSubmit}
        >
          Gönder
        </Button>
      </div>
    </div>
  );
}
