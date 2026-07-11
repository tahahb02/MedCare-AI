import { useQuery } from '@tanstack/react-query';
import { CreditCard, Calendar, Clock, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import SubscriptionCard from '../../components/SubscriptionCard';
import { formatCurrency, formatDate, daysUntil } from '../../utils/helpers';

export default function SubscriptionPage() {
  const { data, isLoading } = useQuery({ queryKey: ['patient-subscription'], queryFn: async () => { const { data } = await api.get('/patients/subscription'); return data; } });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-medcare-green border-t-transparent rounded-full animate-spin"></div></div>;

  const sub = data?.subscription;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><CreditCard size={24} className="text-medcare-green" /> Mon Abonnement</h1>

      <SubscriptionCard subscription={sub} />

      {sub && (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Détails</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl"><p className="text-xs text-gray-500 mb-1">Type</p><p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{sub.planType}</p></div>
            <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl"><p className="text-xs text-gray-500 mb-1">Montant</p><p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(sub.amount)}</p></div>
            <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl"><p className="text-xs text-gray-500 mb-1">Date de début</p><p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(sub.startDate)}</p></div>
            <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl"><p className="text-xs text-gray-500 mb-1">Date de fin</p><p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(sub.endDate)}</p></div>
            <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl"><p className="text-xs text-gray-500 mb-1">Prochain paiement</p><p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(sub.nextPaymentDate)}</p></div>
            <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl"><p className="text-xs text-gray-500 mb-1">Mode de paiement</p><p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{sub.paymentMethod?.replace(/_/g, ' ') || 'N/A'}</p></div>
          </div>

          {(sub.history || []).length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Historique</h4>
              <div className="space-y-2">{sub.history.map((h, i) => <div key={i} className="flex items-center gap-3 p-2 text-sm"><CheckCircle size={14} className="text-green-500" /><span className="text-gray-600 dark:text-dark-text">{h.action} • {formatDate(h.date)}</span><span className="ml-auto text-gray-500">{formatCurrency(h.amount)}</span></div>)}</div>
            </div>
          )}
        </div>
      )}

      {!sub && <div className="text-center py-12"><CreditCard size={48} className="mx-auto text-gray-300 mb-3" /><p className="text-sm text-gray-400">Aucun abonnement actif. Contactez la clinique.</p></div>}
    </div>
  );
}
