import { Outlet } from 'react-router-dom';

/**
 * Layout for business pages (dashboard, offer management).
 * No consumer tab bar — separate business navigation.
 */
export default function BusinessLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <Outlet />
    </div>
  );
}
