import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Users, Mail, Phone, ExternalLink } from 'lucide-react';
import api from '../../api/axios';
import SubscriptionCard from '../../components/SubscriptionCard';
import { formatDate, daysUntil } from '../../utils/helpers';

export default function PatientList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-patients', search, page],
    queryFn: async () => { const { data } = await api.get(`/admin/patients?search=${search}&page=${page}&limit=15`); return data; }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Users size={24} className="text-medcare-purple" /> Mes Patients</h1>
        <Link to="/admin/create-patient" className="px-4 py-2.5 rounded-xl bg-medcare-purple text-white text-sm font-medium hover:bg-medcare-purple/90 flex items-center gap-2">+ Nouveau patient</Link>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher un patient..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32"><div className="w-8 h-8 border-4 border-medcare-purple border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead><tr className="border-b border-gray-100 dark:border-dark-border">
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-dark-text uppercase">Patient</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-dark-text uppercase">Téléphone</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-dark-text uppercase">Abonnement</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 dark:text-dark-text uppercase">Fin</th>
              <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 dark:text-dark-text uppercase">Actions</th>
            </tr></thead>
            <tbody>
              {(data?.patients || []).map((p, i) => (
                <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-gray-50 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-medcare-purple/10 flex items-center justify-center text-medcare-purple font-semibold text-sm">{p.name?.[0]}</div><div><p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p><p className="text-xs text-gray-500 dark:text-dark-text flex items-center gap-1"><Mail size={12} /> {p.email}</p></div></div></td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-text">{p.phone || 'N/A'}</td>
                  <td className="px-6 py-4"><SubscriptionCard subscription={p.subscription} compact /></td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-text">{formatDate(p.subscription?.endDate)}</td>
                  <td className="px-6 py-4 text-right"><Link to={`/admin/patients/${p._id}`} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg text-gray-500 inline-flex"><ExternalLink size={16} /></Link></td>
                </motion.tr>
              ))}
              {(!data?.patients || data.patients.length === 0) && <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">Aucun patient trouvé</td></tr>}
            </tbody>
          </table>
          {data?.pages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100 dark:border-dark-border">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm ${p === page ? 'bg-medcare-purple text-white' : 'text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-bg'}`}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
