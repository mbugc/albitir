import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

function LoadingScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary-700" />
        <p className="text-sm text-slate-400">Yükleniyor...</p>
      </div>
    </div>
  );
}

export default function RequireAuth() {
  const { firebaseUser, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!firebaseUser) return <Navigate to="/auth" replace />;
  return <Outlet />;
}
