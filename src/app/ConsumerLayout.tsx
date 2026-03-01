import { Outlet } from 'react-router-dom';
import BottomTabBar from '@/components/BottomTabBar';

/**
 * Layout for authenticated consumer pages.
 * Renders content with bottom tab bar navigation.
 */
export default function ConsumerLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Main content — padded at bottom for tab bar */}
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  );
}
