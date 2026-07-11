import { Outlet } from 'react-router-dom';
import SidebarMedecin from '../components/SidebarMedecin';
import { useSidebar } from '../context/SidebarContext';

export default function MainLayoutMedecin() {
  const { collapsed } = useSidebar();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <SidebarMedecin />
      <main className={`transition-all duration-200 ${collapsed ? 'ml-[72px]' : 'ml-[256px]'}`}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
