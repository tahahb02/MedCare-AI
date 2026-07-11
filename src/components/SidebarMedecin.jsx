import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Calendar, ClipboardList, MessageCircle, Phone, Bell, Brain, UsersRound, Search, Settings, LogOut, ChevronLeft, ChevronRight, Pill, Video, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const links = [
  { to: '/medecin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/medecin/patients', icon: Users, label: 'Mes Patients' },
  { to: '/medecin/documents', icon: FileText, label: 'Documents' },
  { to: '/medecin/appointments', icon: Calendar, label: 'Rendez-vous' },
  { to: '/medecin/prescriptions', icon: ClipboardList, label: 'Prescriptions' },
  { to: '/medecin/messages', icon: MessageCircle, label: 'Messagerie' },
  { to: '/medecin/clinical-decision', icon: Brain, label: 'Aide Décision' },
  { to: '/medecin/drug-interactions', icon: Pill, label: 'Interactions Médicaments' },
  { to: '/medecin/waiting-room', icon: UsersRound, label: 'Salle d\'Attente' },
];

export default function SidebarMedecin() {
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-medcare-blue to-medcare-purple flex items-center justify-center">
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
                    ? 'bg-medcare-blue/10 text-medcare-blue'
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
          <div className="w-8 h-8 rounded-full bg-medcare-blue/20 flex items-center justify-center text-medcare-blue text-sm font-bold">
            {user?.name?.[0] || 'D'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-dark-text">Médecin</p>
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
