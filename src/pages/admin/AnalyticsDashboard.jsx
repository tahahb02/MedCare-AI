import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/helpers';

export default function AnalyticsDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-analytics'], queryFn: async () => { const { data } = await api.get('/admin/analytics'); return data; } });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-medcare-purple border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><BarChart3 size={24} className="text-medcare-purple" /> Analytics & Business Intelligence</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medcare-purple to-indigo-500 flex items-center justify-center"><Users size={18} className="text-white" /></div><div><p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.totalPatients || 0}</p><p className="text-xs text-gray-500">Total patients</p></div></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medcare-blue to-blue-600 flex items-center justify-center"><CreditCard size={18} className="text-white" /></div><div><p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(data?.totalRevenue || 0)}</p><p className="text-xs text-gray-500">Revenus totaux</p></div></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medcare-green to-emerald-600 flex items-center justify-center"><TrendingUp size={18} className="text-white" /></div><div><p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.activeSubscriptions || 0}</p><p className="text-xs text-gray-500">Abonnements actifs</p></div></div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Répartition statuts abonnements</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={(data?.renewalBreakdown || []).map(d => ({ name: d._id?.replace(/_/g, ' ') || 'N/A', count: d.count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Croissance patients</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={(data?.patientStats || []).map(d => ({ name: d._id, count: d.count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
