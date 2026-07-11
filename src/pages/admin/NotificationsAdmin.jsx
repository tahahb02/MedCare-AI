import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../../api/axios';
import { formatRelative } from '../../utils/helpers';

export default function NotificationsAdmin() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin-notifications'], queryFn: async () => { const { data } = await api.get('/admin/notifications'); return data; } });
  const markAllRead = useMutation({ mutationFn: () => api.put('/admin/notifications/read-all'), onSuccess: () => queryClient.invalidateQueries('admin-notifications') });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Bell size={24} className="text-medcare-purple" /> Notifications</h1>
        {data?.unread > 0 && <button onClick={() => markAllRead.mutate()} className="text-sm text-medcare-purple hover:underline flex items-center gap-1"><CheckCheck size={16} /> Tout marquer lu ({data.unread})</button>}
      </div>
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border divide-y divide-gray-50">
        {(data?.notifications || []).map(n => (
          <div key={n._id} className={`p-4 flex items-start gap-3 ${!n.read ? 'bg-medcare-purple/5' : ''}`}>
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.priority === 'critical' ? 'bg-red-500' : n.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
            <div className="flex-1"><p className={`text-sm ${!n.read ? 'font-semibold' : ''} text-gray-900 dark:text-white`}>{n.title}</p><p className="text-sm text-gray-500 dark:text-dark-text mt-0.5">{n.message}</p><p className="text-xs text-gray-400 mt-1">{formatRelative(n.createdAt)}</p></div>
          </div>
        ))}
        {(!data?.notifications || data.notifications.length === 0) && <p className="p-12 text-center text-sm text-gray-400">Aucune notification</p>}
      </div>
    </div>
  );
}
