import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import api from '../../api/axios';
import { formatDateTime } from '../../utils/helpers';

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ['audit-logs', page], queryFn: async () => { const { data } = await api.get(`/admin/audit-logs?page=${page}`); return data; } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Shield size={24} className="text-medcare-purple" /> Journal d'Audit</h1>
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-gray-100">
            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Action</th>
            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Ressource</th>
            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">IP</th>
          </tr></thead>
          <tbody>
            {(data?.logs || []).map(l => (
              <tr key={l._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 text-sm">{l.userId?.name || 'System'}</td>
                <td className="px-6 py-3 text-sm font-medium">{l.action}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{l.resource} {l.resourceId ? `(${l.resourceId.slice(-6)})` : ''}</td>
                <td className="px-6 py-3 text-sm text-gray-500">{formatDateTime(l.createdAt)}</td>
                <td className="px-6 py-3 text-xs text-gray-400 font-mono">{l.ip || 'N/A'}</td>
              </tr>
            ))}
            {(!data?.logs || data.logs.length === 0) && <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">Aucun log d'audit</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
