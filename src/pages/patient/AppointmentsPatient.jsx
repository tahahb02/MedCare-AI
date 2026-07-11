import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Stethoscope } from 'lucide-react';
import api from '../../api/axios';
import { formatDateTime, urgencyColor } from '../../utils/helpers';

export default function AppointmentsPatient() {
  const { data, isLoading } = useQuery({ queryKey: ['patient-appointments'], queryFn: async () => { const { data } = await api.get('/appointments'); return data; } });

  const upcoming = (data?.appointments || []).filter(a => new Date(a.date) >= new Date() && a.status !== 'annulé');
  const past = (data?.appointments || []).filter(a => new Date(a.date) < new Date() || a.status === 'terminé');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Calendar size={24} className="text-medcare-green" /> Mes Rendez-vous</h1>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">À venir</h2>
        <div className="space-y-3">
          {upcoming.map(a => (
            <div key={a._id} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 flex items-center gap-4">
              <div className="w-14 text-center bg-medcare-green/10 rounded-xl py-2"><p className="text-lg font-bold text-medcare-green">{new Date(a.date).getDate()}</p><p className="text-[10px] text-gray-500 uppercase">{new Date(a.date).toLocaleDateString('fr-FR', { month: 'short' })}</p></div>
              <div className="flex-1"><p className="font-medium text-gray-900 dark:text-white">{a.doctorId?.name || 'Dr. Médecin'}</p><p className="text-sm text-gray-500 flex items-center gap-1"><Stethoscope size={12} /> {a.type || 'Consultation'} • {a.duration || 30}min</p><p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Clock size={10} /> {formatDateTime(a.date)}</p></div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${urgencyColor(a.urgencyDegree)}`}>{a.urgencyDegree}</span>
            </div>
          ))}
          {upcoming.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Aucun rendez-vous à venir</p>}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Passés</h2>
        <div className="space-y-3">
          {past.slice(0, 10).map(a => (
            <div key={a._id} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 flex items-center gap-4 opacity-75">
              <div className="w-14 text-center bg-gray-100 dark:bg-dark-bg rounded-xl py-2"><p className="text-lg font-bold text-gray-600">{new Date(a.date).getDate()}</p><p className="text-[10px] text-gray-400 uppercase">{new Date(a.date).toLocaleDateString('fr-FR', { month: 'short' })}</p></div>
              <div className="flex-1"><p className="font-medium text-gray-900 dark:text-white">{a.doctorId?.name || 'Dr. Médecin'}</p><p className="text-sm text-gray-500">{a.type || 'Consultation'}</p></div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${a.status === 'terminé' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{a.status}</span>
            </div>
          ))}
          {past.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Aucun historique</p>}
        </div>
      </div>
    </div>
  );
}
