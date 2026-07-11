import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Heart, Pill, MessageCircle, CreditCard, Trophy, BookOpen, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import { formatDate, healthScoreColor, healthScoreBg, trajectoryColor } from '../../utils/helpers';
import HealthScoreCard from '../../components/HealthScoreCard';
import SubscriptionCard from '../../components/SubscriptionCard';
import NotificationBell from '../../components/NotificationBell';

export default function PatientDashboard() {
  const { data: metrics } = useQuery({ queryKey: ['patient-metrics'], queryFn: async () => { const { data } = await api.get('/patients/metrics'); return data; } });
  const { data: subscription } = useQuery({ queryKey: ['patient-subscription'], queryFn: async () => { const { data } = await api.get('/patients/subscription'); return data; } });
  const { data: gamification } = useQuery({ queryKey: ['patient-gamification'], queryFn: async () => { const { data } = await api.get('/patients/gamification'); return data; } });
  const { data: score } = useQuery({ queryKey: ['patient-health-score'], queryFn: async () => { const { data } = await api.get('/patients/health-score'); return data; } });

  const healthScore = score?.latest?.score || metrics?.healthScore || 75;
  const trajectory = metrics?.trajectory || 'stable';

  const scoreHistory = (score?.scores || []).slice().reverse().map(s => ({ date: formatDate(s.date), score: s.score }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mon Tableau de bord</h1>
          <p className="text-gray-500 dark:text-dark-text text-sm">Vue d'ensemble de votre santé</p>
        </div>
        <NotificationBell />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <HealthScoreCard score={healthScore} trajectory={trajectory} showDetails />

          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Activity size={18} className="text-medcare-green" /> Évolution Score Santé</h3>
            {scoreHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-32 text-sm text-gray-400">Commencez à saisir vos données pour voir l'évolution</div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 text-center">
              <p className="text-2xl font-bold text-medcare-green">{gamification?.profile?.points || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Points</p>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 text-center">
              <p className="text-2xl font-bold text-medcare-purple">Nv. {gamification?.profile?.level || 1}</p>
              <p className="text-xs text-gray-500 mt-1">Niveau</p>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 text-center">
              <p className="text-2xl font-bold text-medcare-amber">{gamification?.profile?.streak?.currentDays || 0}j</p>
              <p className="text-xs text-gray-500 mt-1">Série</p>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 text-center">
              <p className="text-2xl font-bold text-medcare-blue">{(metrics?.recentAppointments || []).length}</p>
              <p className="text-xs text-gray-500 mt-1">RDV</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SubscriptionCard subscription={subscription?.subscription} />

          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Calendar size={16} className="text-medcare-green" /> Prochains RDV</h3>
            <div className="space-y-2">
              {(metrics?.recentAppointments || []).slice(0, 3).map(a => (
                <div key={a._id} className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{a.doctorId?.name || 'Médecin'}</p>
                  <p className="text-xs text-gray-500">{formatDate(a.date)} • {a.type}</p>
                </div>
              ))}
              {(!metrics?.recentAppointments || metrics.recentAppointments.length === 0) && <p className="text-xs text-gray-400 text-center py-3">Aucun RDV à venir</p>}
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Trophy size={16} className="text-medcare-amber" /> Défis Santé</h3>
            <div className="space-y-2">
              <div className="p-3 bg-medcare-green/5 rounded-xl">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Saisie quotidienne</p>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-dark-bg rounded-full mt-2 overflow-hidden"><div className="h-full bg-medcare-green rounded-full" style={{ width: `${Math.min(100, ((gamification?.profile?.streak?.currentDays || 0) / 7) * 100)}%` }}></div></div>
                <p className="text-xs text-gray-500 mt-1">{gamification?.profile?.streak?.currentDays || 0}/7 jours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
