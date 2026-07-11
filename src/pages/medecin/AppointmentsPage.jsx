import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import { formatDateTime, urgencyColor } from '../../utils/helpers';

export default function AppointmentsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['doctor-appointments'], queryFn: async () => { const { data } = await api.get('/appointments'); return data; } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Calendar size={24} className="text-medcare-blue" /> Rendez-vous</h1>
      <div className="space-y-3">
        {(data?.appointments || []).map(a => (
          <div key={a._id} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 flex flex-wrap items-center gap-3 md:gap-4">
            <div className="w-12 text-center"><p className="text-lg font-bold text-medcare-blue">{new Date(a.date).getDate()}</p><p className="text-xs text-gray-500 uppercase">{new Date(a.date).toLocaleDateString('fr-FR', { month: 'short' })}</p></div>
            <div className="flex-1 min-w-0"><p className="font-medium text-gray-900 dark:text-white truncate">{a.patientId?.name || 'Patient'}</p><p className="text-sm text-gray-500">{a.type || 'Consultation'} • {a.duration || 30}min</p></div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${urgencyColor(a.urgencyDegree)}`}>{a.urgencyDegree}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${a.status === 'confirmé' ? 'bg-green-100 text-green-700' : a.status === 'annulé' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{a.status}</span>
            </div>
          </div>
        ))}
        {(!data?.appointments || data.appointments.length === 0) && <p className="text-center text-sm text-gray-400 py-12">Aucun rendez-vous</p>}
      </div>
    </div>
  );
}
