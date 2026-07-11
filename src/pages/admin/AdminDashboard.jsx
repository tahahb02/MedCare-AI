import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, CreditCard, Calendar, TrendingUp, AlertTriangle, UserPlus, Stethoscope } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import api from '../../api/axios';
import { formatCurrency, formatDate, subscriptionStatusColor, daysUntil } from '../../utils/helpers';
import NotificationBell from '../../components/NotificationBell';

const COLORS = ['#7c3aed', '#6366f1', '#2563eb', '#10b981', '#f59e0b'];

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => { const { data } = await api.get('/admin/dashboard'); return data; }
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-medcare-purple border-t-transparent rounded-full animate-spin"></div></div>;

  const { stats, subscriptionDistribution, monthlyRevenueHistory, patientGrowth, upcomingPayments, expiredNotRenewed } = data || {};
  const revenueData = (monthlyRevenueHistory || []).map(d => ({ name: `${d._id.month}/${d._id.year}`, total: d.total, count: d.count }));
  const patientData = (patientGrowth || []).map(d => ({ name: `${d._id.month}/${d._id.year}`, count: d.count }));

  const statCards = [
    { label: 'Patients Actifs', value: stats?.totalPatients || 0, icon: Users, color: 'from-medcare-purple to-medcare-indigo' },
    { label: 'Médecins', value: stats?.totalDoctors || 0, icon: Stethoscope, color: 'from-medcare-blue to-blue-600' },
    { label: 'Abonnements Actifs', value: stats?.activeSubscriptions || 0, icon: CreditCard, color: 'from-medcare-green to-emerald-600' },
    { label: 'Revenus du mois', value: formatCurrency(stats?.monthlyRevenue || 0), icon: TrendingUp, color: 'from-medcare-amber to-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-dark-text text-sm">Vue d'ensemble de votre clinique</p>
        </div>
        <NotificationBell />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon size={20} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-dark-text mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenus mensuels</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Répartition abonnements</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={(subscriptionDistribution || []).map(d => ({ name: d._id || 'N/A', value: d.count }))} cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {(subscriptionDistribution || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Calendar size={18} className="text-medcare-purple" /> Prochains paiements</h3>
          <div className="space-y-3">
            {(upcomingPayments || []).slice(0, 5).map((p) => (
              <div key={p._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{p.patientId?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500 dark:text-dark-text">{formatCurrency(p.amount)} • {p.planType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(p.nextPaymentDate)}</p>
                  <p className={`text-xs ${daysUntil(p.nextPaymentDate) <= 7 ? 'text-red-500' : 'text-gray-500'}`}>{daysUntil(p.nextPaymentDate)} jours</p>
                </div>
              </div>
            ))}
            {(!upcomingPayments || upcomingPayments.length === 0) && <p className="text-sm text-gray-400 text-center py-4">Aucun paiement à venir</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-orange-500" /> Abonnements expirés</h3>
          <div className="space-y-3">
            {(expiredNotRenewed || []).slice(0, 5).map((p) => (
              <div key={p._id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-500/10 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{p.patientId?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500 dark:text-dark-text">Expiré le {formatDate(p.endDate)}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">{Math.abs(daysUntil(p.endDate))}j</span>
              </div>
            ))}
            {(!expiredNotRenewed || expiredNotRenewed.length === 0) && <p className="text-sm text-gray-400 text-center py-4">Aucun abonnement expiré</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
