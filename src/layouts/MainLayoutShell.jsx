import { Outlet } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import MobileHeader from '../components/MobileHeader';

export default function MainLayoutShell({ SidebarComponent }) {
  const { collapsed, isMobile } = useSidebar();

  const marginLeft = isMobile ? 'ml-0' : collapsed ? 'ml-[72px]' : 'ml-[256px]';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <SidebarComponent />
      {isMobile && <MobileHeader />}
      <main className={`transition-all duration-200 ${marginLeft}`}>
        <div className={`p-4 md:p-6 ${isMobile ? 'pt-20' : ''}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
