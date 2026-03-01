import { Outlet } from 'react-router-dom';

/**
 * Layout for auth pages (login, signup, location setup).
 * No tab bar, full-screen.
 */
export default function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Outlet />
    </div>
  );
}
