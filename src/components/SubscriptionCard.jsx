import { motion } from 'framer-motion';
import { CreditCard, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate, daysUntil, subscriptionStatusColor } from '../utils/helpers';

export default function SubscriptionCard({ subscription, compact = false }) {
  if (!subscription) return null;

  const days = daysUntil(subscription.endDate);
  const progress = Math.max(0, Math.min(100, (days / (subscription.planType === 'mensuel' ? 30 : subscription.planType === 'trimestriel' ? 90 : subscription.planType === 'semestre' ? 180 : 365)) * 100));

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${subscriptionStatusColor(subscription.status)}`}>
        <CreditCard size={14} />
        <span className="capitalize">{subscription.status?.replace(/_/g, ' ')}</span>
        {subscription.status === 'actif' && <span>({days}j)</span>}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <CreditCard size={18} className="text-medcare-purple" />
          Abonnement
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${subscriptionStatusColor(subscription.status)}`}>
          {subscription.status?.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-3">
          <p className="text-xs text-gray-500 dark:text-dark-text mb-1">Type</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{subscription.planType}</p>
        </div>
        <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-3">
          <p className="text-xs text-gray-500 dark:text-dark-text mb-1">Montant</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(subscription.amount)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-3">
          <p className="text-xs text-gray-500 dark:text-dark-text mb-1">Début</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(subscription.startDate)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-3">
          <p className="text-xs text-gray-500 dark:text-dark-text mb-1">Fin</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(subscription.endDate)}</p>
        </div>
      </div>

      {subscription.status === 'actif' && (
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-gray-500 dark:text-dark-text flex items-center gap-1"><Clock size={14} /> Temps restant</span>
            <span className={`font-semibold ${days <= 7 ? 'text-red-600' : days <= 30 ? 'text-orange-500' : 'text-green-600'}`}>{days} jours</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-dark-bg rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }} className={`h-full rounded-full ${days <= 7 ? 'bg-red-500' : days <= 30 ? 'bg-orange-500' : 'bg-green-500'}`} />
          </div>
        </div>
      )}

      {days <= 7 && subscription.status === 'actif' && (
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-start gap-2">
          <AlertTriangle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-orange-700 dark:text-orange-400">Votre abonnement expire dans {days} jours. Contactez la clinique pour renouveler.</p>
        </div>
      )}
    </motion.div>
  );
}
