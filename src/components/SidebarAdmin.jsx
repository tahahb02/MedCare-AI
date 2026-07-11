import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, CreditCard, Bell, MessageCircle, Mail, BarChart3, Shield, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import SidebarShell from './SidebarShell';
import ThemeToggle from './ThemeToggle';

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/create-patient', icon: UserPlus, label: 'Créer Patient' },
  { to: '/admin/patients', icon: Users, label: 'Mes Patients' },
  { to: '/admin/subscriptions', icon: CreditCard, label: 'Abonnements' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/admin/messages', icon: MessageCircle, label: 'Messagerie' },
  { to: '/admin/newsletters', icon: Mail, label: 'Newsletters' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/audit', icon: Shield, label: 'Journal Audit' },
  { to: '/admin/settings', icon: Settings, label: 'Paramètres' },
];

export default function SidebarAdmin() {
  const { collapsed, toggleSidebar, isMobile, closeMobile } = useSidebar();
  const { user, logout } = useAuth();

  const handleNav = () => { if (isMobile) closeMobile(); };

  return (
    <SidebarShell>
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-dark-border">
        {(!collapsed || isMobile) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-medcare-purple to-medcare-indigo flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">MedCare AI</span>
          </motion.div>
        )}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {!isMobile && <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg text-gray-500">{collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button>}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} onClick={handleNav}>
            {({ isActive }) => (
              <motion.div whileHover={{ x: 2 }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-medcare-purple/10 text-medcare-purple' : 'text-gray-600 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-gray-900 dark:hover:text-white'}`}>
                <Icon size={20} />
                {(!collapsed || isMobile) && <span>{label}</span>}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100 dark:border-dark-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-medcare-purple/20 flex items-center justify-center text-medcare-purple text-sm font-bold">{user?.name?.[0] || 'A'}</div>
          {(!collapsed || isMobile) && <div className="min-w-0"><p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p><p className="text-xs text-gray-500 dark:text-dark-text">Secrétaire</p></div>}
        </div>
        <button onClick={() => { logout(); handleNav(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
          <LogOut size={20} />
          {(!collapsed || isMobile) && <span>Déconnexion</span>}
        </button>
      </div>
    </SidebarShell>
  );
}
