import { Menu, X } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

export default function MobileHeader() {
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border px-4 py-3 flex items-center justify-between">
      <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors">
        {mobileOpen ? <X size={22} className="text-gray-700 dark:text-white" /> : <Menu size={22} className="text-gray-700 dark:text-white" />}
      </button>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationBell />
      </div>
    </div>
  );
}
