import { useNavigate } from 'react-router-dom';

export default function RoleSelectPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Hero / Branding */}
      <div className="flex flex-col items-center justify-center bg-primary-700 px-8 pb-10 pt-16 text-white">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-4xl">
          🛍
        </div>
        <h1 className="text-4xl font-black tracking-tight">albitir</h1>
        <p className="mt-2 text-center text-base text-primary-200">
          Fazla yiyeceği kurtar, tasarruf et.
        </p>
      </div>

      {/* Role Cards */}
      <div className="flex flex-1 flex-col gap-4 px-6 pb-10 pt-8">
        <p className="text-center text-sm font-medium text-slate-500">
          Nasıl devam etmek istersin?
        </p>

        {/* Consumer Card */}
        <button
          onClick={() => navigate('/auth/consumer')}
          className="flex items-start gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 text-left transition-all hover:border-primary-300 hover:shadow-md active:scale-[0.98]"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-2xl">
            🛒
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-slate-900">Müşteri</span>
            <span className="text-sm text-slate-500">
              Yakınındaki fırsatları keşfet ve tasarruf et
            </span>
          </div>
        </button>

        {/* Merchant Card */}
        <button
          onClick={() => navigate('/auth/business')}
          className="flex items-start gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 text-left transition-all hover:border-primary-300 hover:shadow-md active:scale-[0.98]"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-2xl">
            🏪
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-slate-900">İşletme</span>
            <span className="text-sm text-slate-500">
              Fazla ürünlerini sat, israfı azalt
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
