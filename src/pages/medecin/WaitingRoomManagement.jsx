import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Clock, Bell, Stethoscope, UserCheck, Hourglass } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';

const statusConfig = {
  waiting: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300', dot: 'bg-yellow-500' },
  notified: { label: 'Notifié', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300', dot: 'bg-blue-500' },
  in_consultation: { label: 'En consultation', color: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300', dot: 'bg-green-500' },
};

function WaitTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const update = () => setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  const min = Math.floor(elapsed / 60);
  const sec = elapsed % 60;
  return <span className="text-sm font-mono text-gray-900 dark:text-white">{min}m {sec.toString().padStart(2, '0')}s</span>;
}

export default function WaitingRoomManagement() {
  const queryClient = useQueryClient();
  const [doctorStatus, setDoctorStatus] = useState('available');

  const { data, isLoading } = useQuery({
    queryKey: ['medecin-waiting-room'],
    queryFn: async () => { const { data } = await api.get('/medecin/waiting-room'); return data; },
    refetchInterval: 30000,
  });

  const notifyMutation = useMutation({
    mutationFn: async (patientId) => { await api.post(`/medecin/waiting-room/notify/${patientId}`); },
    onSuccess: () => { queryClient.invalidateQueries('medecin-waiting-room'); toast.success('Patient notifié'); },
    onError: () => toast.error('Erreur'),
  });

  const startConsultMutation = useMutation({
    mutationFn: async (patientId) => { await api.post(`/medecin/waiting-room/start-consultation/${patientId}`); },
    onSuccess: () => { queryClient.invalidateQueries('medecin-waiting-room'); toast.success('Consultation démarrée'); },
    onError: () => toast.error('Erreur'),
  });

  const toggleDoctorStatus = useMutation({
    mutationFn: async (status) => { await api.put('/medecin/status', { status }); },
    onSuccess: () => { queryClient.invalidateQueries('medecin-waiting-room'); toast.success('Statut mis à jour'); },
    onError: () => toast.error('Erreur'),
  });

  const queue = data?.queue || [];
  const waitingCount = queue.filter(p => p.status === 'waiting').length;
  const inConsultCount = queue.filter(p => p.status === 'in_consultation').length;

  const doctorStatusConfig = {
    available: { label: 'Disponible', color: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300', dot: 'bg-green-500' },
    busy: { label: 'Occupé', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300', dot: 'bg-red-500' },
    break: { label: 'Pause', color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300', dot: 'bg-gray-500' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Users size={24} className="text-medcare-purple" /> Salle d'attente</h1>
          <p className="text-gray-500 dark:text-dark-text text-sm">Gérez votre file de patients</p>
        </div>
        <div className="flex items-center gap-3">
          {Object.entries(doctorStatusConfig).map(([key, cfg]) => (
            <button key={key} onClick={() => { setDoctorStatus(key); toggleDoctorStatus.mutate(key); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${doctorStatus === key ? `${cfg.color} ring-2 ring-offset-1 ring-current` : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${cfg.dot}`}></span>{cfg.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'En attente', value: waitingCount, icon: Hourglass, color: 'from-medcare-amber to-orange-500' },
          { label: 'En consultation', value: inConsultCount, icon: Stethoscope, color: 'from-medcare-green to-emerald-600' },
          { label: 'Total aujourd\'hui', value: queue.length, icon: Users, color: 'from-medcare-purple to-medcare-indigo' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon size={20} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-dark-text mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-medcare-purple border-t-transparent rounded-full animate-spin"></div></div>
      ) : queue.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border">
          <Users size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">Aucun patient en salle d'attente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((patient, i) => {
            const cfg = statusConfig[patient.status] || statusConfig.waiting;
            return (
              <motion.div key={patient._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-medcare-purple/10 flex items-center justify-center text-medcare-purple font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{patient.patientId?.name || patient.name || 'Patient'}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                          {cfg.label}
                        </span>
                        {patient.waitStartTime && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-text">
                            <Clock size={12} /> <WaitTimer startTime={patient.waitStartTime} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {patient.status === 'waiting' && (
                      <button onClick={() => notifyMutation.mutate(patient.patientId?._id || patient._id)} disabled={notifyMutation.isPending} className="px-4 py-2 rounded-xl bg-medcare-blue text-white text-sm font-medium flex items-center gap-1.5 hover:bg-medcare-blue/90 disabled:opacity-50 transition-colors">
                        <Bell size={14} /> Notifier
                      </button>
                    )}
                    {(patient.status === 'waiting' || patient.status === 'notified') && (
                      <button onClick={() => startConsultMutation.mutate(patient.patientId?._id || patient._id)} disabled={startConsultMutation.isPending} className="px-4 py-2 rounded-xl bg-medcare-green text-white text-sm font-medium flex items-center gap-1.5 hover:bg-medcare-green/90 disabled:opacity-50 transition-colors">
                        <UserCheck size={14} /> Consulter
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
