import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CreditCard, Filter, RefreshCw, Ban, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatCurrency, formatDate, subscriptionStatusColor, daysUntil } from '../../utils/helpers';

export default function SubscriptionManagement() {
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-subs', statusFilter, planFilter],
    queryFn: async () => { const { data } = await api.get(`/admin/subscriptions?status=${statusFilter}&planType=${planFilter}`); return data; }
  });

  const renewMutation = useMutation({ mutationFn: async ({ id, planType, amount }) => { const { data } = await api.post(`/admin/subscriptions/${id}/renew`, { planType, amount, paymentMethod: 'especes' }); return data; }, onSuccess: () => { queryClient.invalidateQueries('admin-subs'); toast.success('Abonnement renouvelé !'); }, onError: (e) => toast.error(e.response?.data?.message || 'Erreur') });
  const suspendMutation = useMutation({ mutationFn: async (id) => { const { data } = await api.post(`/admin/subscriptions/${id}/suspend`, { reason: 'Suspendu par admin' }); return data; }, onSuccess: () => { queryClient.invalidateQueries('admin-subs'); toast.success('Abonnement suspendu.'); }, onError: (e) => toast.error(e.response?.data?.message || 'Erreur') });
  const cancelMutation = useMutation({ mutationFn: async (id) => { const { data } = await api.post(`/admin/subscriptions/${id}/cancel`, { reason: 'Annulé par admin' }); return data; }, onSuccess: () => { queryClient.invalidateQueries('admin-subs'); toast.success('Abonnement annulé.'); }, onError: (e) => toast.error(e.response?.data?.message || 'Erreur') });

  const statusOptions = ['', 'actif', 'expiré', 'suspendu', 'en_période_de_grâce', 'en_attente', 'annulé'];
  const planOptions = ['', 'mensuel', 'trimestriel', 'semestre', 'annuel'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><CreditCard size={24} className="text-medcare-purple" /> Gestion des Abonnements</h1>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2"><Filter size={16} className="text-gray-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-700 dark:text-dark-text">
            {statusOptions.map(s => <option key={s} value={s}>{s ? s.replace(/_/g, ' ') : 'Tous les statuts'}</option>)}
          </select>
        </div>
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-700 dark:text-dark-text">
          {planOptions.map(p => <option key={p} value={p}>{p ? p.charAt(0).toUpperCase() + p.slice(1) : 'Tous les plans'}</option>)}
        </select>
      </div>

      {isLoading ? <div className="flex items-center justify-center h-32"><div className="w-8 h-8 border-4 border-medcare-purple border-t-transparent rounded-full animate-spin"></div></div> : (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead><tr className="border-b border-gray-100 dark:border-dark-border">
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Fin</th>
              <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr></thead>
            <tbody>
              {(data?.subscriptions || []).map((sub, i) => (
                <motion.tr key={sub._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4"><p className="text-sm font-medium text-gray-900 dark:text-white">{sub.patientId?.name || 'N/A'}</p><p className="text-xs text-gray-500">{sub.patientId?.email}</p></td>
                  <td className="px-6 py-4 text-sm capitalize">{sub.planType}</td>
                  <td className="px-6 py-4 text-sm font-medium">{formatCurrency(sub.amount)}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${subscriptionStatusColor(sub.status)}`}>{sub.status?.replace(/_/g, ' ')}</span></td>
                  <td className="px-6 py-4 text-sm">{formatDate(sub.endDate)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {sub.status !== 'actif' && <button onClick={() => renewMutation.mutate({ id: sub._id, planType: sub.planType, amount: sub.amount })} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Renouveler"><RefreshCw size={14} /></button>}
                      {sub.status === 'actif' && <button onClick={() => suspendMutation.mutate(sub._id)} className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-600" title="Suspendre"><Ban size={14} /></button>}
                      {sub.status !== 'annulé' && <button onClick={() => cancelMutation.mutate(sub._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Annuler"><XCircle size={14} /></button>}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {(!data?.subscriptions || data.subscriptions.length === 0) && <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">Aucun abonnement trouvé</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
