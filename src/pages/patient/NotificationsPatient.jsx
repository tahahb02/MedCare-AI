import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, MessageCircle, Calendar, Pill, CreditCard } from 'lucide-react';
import api from '../../api/axios';
import { formatRelative } from '../../utils/helpers';

const typeIcon = (t) => {
  const map = { 'rendez-vous': Calendar, 'message': MessageCircle, 'prescription': Pill, 'rappel_abonnement': CreditCard, 'analyse_prête': Pill };
  return map[t] || Bell;
};

export default function NotificationsPatient() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['patient-notifications'], queryFn: async () => { const { data } = await api.get('/notifications'); return data; } });
  const markAll = useMutation({ mutationFn: () => api.put('/notifications/read-all'), onSuccess: () => queryClient.invalidateQueries('patient-notifications') });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Bell size={24} className="text-medcare-green" /> Notifications</h1>
        {data?.unread > 0 && <button onClick={() => markAll.mutate()} className="text-sm text-medcare-green hover:underline flex items-center gap-1"><CheckCheck size={16} /> Tout lire</button>}
      </div>
      <div className="space-y-2">
        {(data?.notifications || []).map(n => {
          const Icon = typeIcon(n.type);
          return (
            <div key={n._id} className={`bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 flex items-start gap-3 ${!n.read ? 'ring-1 ring-medcare-green/30 bg-medcare-green/5' : ''}`}>
              <div className="w-9 h-9 rounded-xl bg-medcare-green/10 flex items-center justify-center flex-shrink-0"><Icon size={16} className="text-medcare-green" /></div>
              <div className="flex-1"><p className={`text-sm ${!n.read ? 'font-semibold' : ''} text-gray-900 dark:text-white`}>{n.title}</p><p className="text-sm text-gray-500 dark:text-dark-text mt-0.5">{n.message}</p><p className="text-xs text-gray-400 mt-1">{formatRelative(n.createdAt)}</p></div>
            </div>
          );
        })}
        {(!data?.notifications || data.notifications.length === 0) && <p className="text-center text-sm text-gray-400 py-12">Aucune notification</p>}
      </div>
    </div>
  );
}
