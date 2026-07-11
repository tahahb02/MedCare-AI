import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ExternalLink, Search } from 'lucide-react';
import { useState } from 'react';
import api from '../../api/axios';

export default function PatientListMedecin() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['doctor-patients'], queryFn: async () => { const { data } = await api.get('/docteurs/patients'); return data; } });

  const patients = (data?.patients || []).filter(p => !search || p.userId?.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Users size={24} className="text-medcare-blue" /> Mes Patients</h1>
      <div className="relative max-w-md"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-medcare-blue focus:border-transparent outline-none" /></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? <div className="col-span-full flex items-center justify-center h-32"><div className="w-8 h-8 border-4 border-medcare-blue border-t-transparent rounded-full animate-spin"></div></div> :
          patients.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-medcare-blue/10 flex items-center justify-center text-medcare-blue font-bold">{p.userId?.name?.[0] || 'P'}</div>
                <div><p className="font-medium text-gray-900 dark:text-white">{p.userId?.name}</p><p className="text-xs text-gray-500">{p.medicalRecordNumber}</p></div>
              </div>
              <div className="space-y-1 text-sm text-gray-600 dark:text-dark-text">
                {p.bloodType && <p>Groupe: {p.bloodType}</p>}
                {(p.chronicConditions || []).length > 0 && <p>Conditions: {p.chronicConditions.map(c => c.name).join(', ')}</p>}
              </div>
              <Link to={`/medecin/patients/${p.userId?._id}`} className="mt-3 w-full py-2 rounded-xl bg-medcare-blue/10 text-medcare-blue text-sm font-medium flex items-center justify-center gap-1 hover:bg-medcare-blue/20 transition-colors"><ExternalLink size={14} /> Voir dossier</Link>
            </motion.div>
          ))}
        {(!patients || patients.length === 0) && <p className="col-span-full text-center text-sm text-gray-400 py-12">Aucun patient trouvé</p>}
      </div>
    </div>
  );
}
