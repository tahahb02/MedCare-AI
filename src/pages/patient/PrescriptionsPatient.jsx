import { useQuery } from '@tanstack/react-query';
import { Pill, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';

export default function PrescriptionsPatient() {
  const { data, isLoading } = useQuery({ queryKey: ['patient-prescriptions'], queryFn: async () => { const { data } = await api.get('/prescriptions'); return data; } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Pill size={24} className="text-medcare-green" /> Mes Prescriptions</h1>
      <div className="space-y-4">
        {(data?.prescriptions || []).map(p => (
          <div key={p._id} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div><p className="font-medium text-gray-900 dark:text-white">Dr. {p.doctorId?.name || 'Médecin'}</p><p className="text-xs text-gray-500">{formatDate(p.createdAt)} • {p.diagnosis || 'N/A'}</p></div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{p.status}</span>
            </div>
            <div className="space-y-2">
              {(p.medications || []).map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-medcare-green/10 flex items-center justify-center"><Pill size={14} className="text-medcare-green" /></div>
                  <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-white">{m.name}</p><p className="text-xs text-gray-500">{m.dosage} {m.unit} • {m.frequency} • {m.route}</p></div>
                  <p className="text-xs text-gray-400">{m.duration} jours</p>
                </div>
              ))}
            </div>
            {p.notes && <p className="text-sm text-gray-600 dark:text-dark-text mt-3 p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl">{p.notes}</p>}
          </div>
        ))}
        {(!data?.prescriptions || data.prescriptions.length === 0) && <p className="text-center text-sm text-gray-400 py-12">Aucune prescription</p>}
      </div>
    </div>
  );
}
