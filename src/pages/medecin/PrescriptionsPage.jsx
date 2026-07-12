import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ClipboardList, Pill, Plus } from 'lucide-react';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';

export default function PrescriptionsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['doctor-prescriptions'], queryFn: async () => { const { data } = await api.get('/prescriptions'); return data; } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><ClipboardList size={24} className="text-medcare-blue" /> Prescriptions</h1>
        <Link to="/medecin/prescriptions/create" className="px-4 py-2.5 rounded-xl bg-medcare-blue text-white text-sm font-medium hover:bg-medcare-blue/90 flex items-center gap-2"><Plus size={16} /> Nouvelle prescription</Link>
      </div>
      <div className="space-y-4">
        {(data?.prescriptions || []).map(p => (
          <div key={p._id} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div><p className="font-medium text-gray-900 dark:text-white">{p.patientId?.name || 'Patient'}</p><p className="text-xs text-gray-500">{formatDate(p.createdAt)}</p></div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{p.status}</span>
            </div>
            <div className="space-y-2">{(p.medications || []).map((m, i) => <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-dark-bg rounded-lg"><Pill size={14} className="text-medcare-blue" /><span className="text-sm text-gray-900 dark:text-white">{m.name} {m.dosage}</span><span className="text-xs text-gray-500 ml-auto">{m.frequency}</span></div>)}</div>
            {p.diagnosis && <p className="text-sm text-gray-600 dark:text-dark-text mt-3"><span className="font-medium">Diagnostic:</span> {p.diagnosis}</p>}
          </div>
        ))}
        {(!data?.prescriptions || data.prescriptions.length === 0) && <p className="text-center text-sm text-gray-400 py-12">Aucune prescription</p>}
      </div>
    </div>
  );
}
