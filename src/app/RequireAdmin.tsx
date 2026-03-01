import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { isAdmin } from '@/services/adminService';
import { Skeleton } from '@/components/ui/SkeletonLoader';

export default function RequireAdmin() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const [adminCheck, setAdminCheck] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading || !firebaseUser) return;
    isAdmin(firebaseUser.uid).then(setAdminCheck);
  }, [firebaseUser, authLoading]);

  if (authLoading || adminCheck === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (!firebaseUser || !adminCheck) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
