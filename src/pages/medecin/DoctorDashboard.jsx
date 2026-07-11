import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Users, FileText, MessageCircle, Brain, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';
import NotificationBell from '../../components/NotificationBell';

export default function DoctorDashboard() {
  const { data: stats } = useQuery({ queryKey: ['doctor-stats'], queryFn: async () => { const { data } = await api.get('/docteurs/stats'); return data; } });
  const { data: cohort } = useQuery({ queryKey: ['doctor-cohort'], queryFn: async () => { const { data } = await api.get('/docteurs/cohort'); return data; } });
  const { data: appointments } = useQuery({ queryKey: ['doctor-appointments'], queryFn: async () => { const { data } = await api.get('/appointments?status=confirmé'); return data; } });

  const statCards = [
    { label: "RDV aujourd'hui", value: stats?.todayAppointments || 0, icon: Calendar, color: 'from-medcare-blue to-blue-600' },
    { label: 'Mes patients', value: stats?.totalPatients || 0, icon: Users, color: 'from-medcare-purple to-indigo-500' },
    { label: 'Documents à review', value: stats?.pendingDocs || 0, icon: FileText, color: 'from-medcare-orange to-orange-500' },
    { label: 'Messages', value: stats?.unreadMessages || 0, icon: MessageCircle, color: 'from-medcare-green to-emerald-500' },
  ];

  const pathologyData = Object.entries(cohort?.pathologyCount || {}).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
          <p className="text-gray-500 dark:text-dark-text text-sm">Bonjour Dr. {stats?.name || ''}</p>
        </div>
        <NotificationBell />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-dark-text mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Calendar size={18} className="text-medcare-blue" /> Prochains RDV</h3>
          <div className="space-y-3">
            {(appointments?.appointments || []).slice(0, 5).map(a => (
              <div key={a._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-medcare-blue/10 flex items-center justify-center text-medcare-blue font-semibold text-sm">{a.patientId?.name?.[0] || 'P'}</div>
                  <div><p className="text-sm font-medium text-gray-900 dark:text-white">{a.patientId?.name || 'Patient'}</p><p className="text-xs text-gray-500">{a.type || 'Consultation'}</p></div>
                </div>
                <div className="text-right"><p className="text-sm text-gray-900 dark:text-white">{formatDate(a.date)}</p></div>
              </div>
            ))}
            {(!appointments?.appointments || appointments.appointments.length === 0) && <p className="text-sm text-gray-400 text-center py-4">Aucun RDV confirmé</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Activity size={18} className="text-medcare-purple" /> Pathologies fréquentes</h3>
          {pathologyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pathologyData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">Pas encore de données</div>
          )}
        </div>
      </div>
    </div>
  );
}
