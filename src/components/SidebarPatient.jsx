import { NavLink } from 'react-router-dom';
import { Heart, Upload, Calendar, Pill, MessageCircle, Phone, Bell, CreditCard, Star, CalendarDays, BookOpen, Trophy, Lightbulb, Settings, LogOut, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const links = [
  { to: '/patient', icon: Heart, label: 'Mon Dossier', end: true },
  { to: '/patient/documents', icon: Upload, label: 'Documents' },
  { to: '/patient/appointments', icon: Calendar, label: 'Rendez-vous' },
  { to: '/patient/prescriptions', icon: Pill, label: 'Prescriptions' },
  { to: '/patient/messages', icon: MessageCircle, label: 'Messagerie' },
  { to: '/patient/notifications', icon: Bell, label: 'Notifications' },
  { to: '/patient/subscription', icon: CreditCard, label: 'Mon Abonnement' },
  { to: '/patient/gamification', icon: Trophy, label: 'Points Fidélité' },
  { to: '/patient/health-calendar', icon: CalendarDays, label: 'Calendrier Santé' },
  { to: '/patient/journal', icon: BookOpen, label: 'Journal Santé' },
  { to: '/patient/coaching', icon: Lightbulb, label: 'Coaching' },
  { to: '/patient/waiting-room', icon: Users, label: 'Salle d\'Attente' },
];

export default function SidebarPatient() {
  const { collapsed, toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();

  return (
    <motion.aside
      initial={{ width: collapsed ? 72 : 256 }}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.2 }}
      className="h-screen bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border flex flex-col fixed left-0 top-0 z-40"
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-dark-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-medcare-green to-medcare-emerald flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">MedCare AI</span>
          </div>
        )}
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg text-gray-500">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 2 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-medcare-green/10 text-medcare-green'
                    : 'text-gray-600 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon size={20} />
                {!collapsed && <span>{label}</span>}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100 dark:border-dark-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-medcare-green/20 flex items-center justify-center text-medcare-green text-sm font-bold">
            {user?.name?.[0] || 'P'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-dark-text">Patient</p>
            </div>
          )}
        </div>
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
          <LogOut size={20} />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </motion.aside>
  );
}
