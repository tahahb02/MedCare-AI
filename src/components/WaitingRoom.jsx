import { motion, AnimatePresence } from 'framer-motion';
import { Users, Bell, Clock, UserCircle, RefreshCw } from 'lucide-react';

function PatientView({ queue }) {
  const position = queue.find((p) => p.isCurrentUser)?.position || '-';
  const estimatedWait = queue.find((p) => p.isCurrentUser)?.estimatedWait || null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Users size={18} className="text-primary-500" /> File d'attente
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
          <span>Temps réel</span>
        </div>
      </div>

      <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 text-center">
        <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">#{position}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Votre position dans la file</p>
        {estimatedWait && (
          <div className="flex items-center justify-center gap-1.5 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock size={14} />
            <span>Temps estimé : {estimatedWait}</span>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        {queue.filter((p) => !p.isCurrentUser).slice(0, 5).map((patient, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-dark-border/50">
            <span className="text-xs font-semibold text-gray-400 w-6">#{patient.position}</span>
            <UserCircle size={20} className="text-gray-300 dark:text-gray-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{patient.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DoctorView({ queue }) {
  const notifyPatient = (patient) => {
    // Notification logic handled by parent
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Users size={18} className="text-primary-500" /> Patients en attente
        </h3>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-border px-2 py-0.5 rounded-full">
          {queue.length} patient{queue.length !== 1 ? 's' : ''}
        </span>
      </div>

      <AnimatePresence>
        {queue.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Aucun patient en attente</p>
        ) : (
          queue.map((patient, i) => (
            <motion.div
              key={patient.id || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-border/50 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
            >
              <span className="text-xs font-bold text-gray-400 w-6">#{patient.position}</span>
              <UserCircle size={28} className="text-gray-300 dark:text-gray-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{patient.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{patient.reason || 'Consultation'}</p>
              </div>
              <button
                onClick={() => notifyPatient(patient)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-medium hover:bg-primary-600 transition-colors shrink-0"
              >
                <Bell size={12} /> Notifier
              </button>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WaitingRoom({ queue = [], isDoctor = false }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
      {isDoctor ? <DoctorView queue={queue} /> : <PatientView queue={queue} />}
    </motion.div>
  );
}
