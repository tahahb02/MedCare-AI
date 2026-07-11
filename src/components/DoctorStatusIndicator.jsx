import { motion } from 'framer-motion';

const statusConfig = {
  disponible: { color: 'bg-green-500', ring: 'ring-green-200 dark:ring-green-900', label: 'Disponible', pulse: true },
  en_consultation: { color: 'bg-yellow-500', ring: 'ring-yellow-200 dark:ring-yellow-900', label: 'En consultation', pulse: false },
  en_réunion: { color: 'bg-orange-500', ring: 'ring-orange-200 dark:ring-orange-900', label: 'En réunion', pulse: false },
  absent: { color: 'bg-red-500', ring: 'ring-red-200 dark:ring-red-900', label: 'Absent', pulse: false },
  indisponible: { color: 'bg-gray-400 dark:bg-gray-500', ring: 'ring-gray-200 dark:ring-gray-700', label: 'Indisponible', pulse: false },
};

export default function DoctorStatusIndicator({ status = 'absent', statusMessage, estimatedAvailableAt }) {
  const cfg = statusConfig[status] || statusConfig.absent;

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center">
        <div className={`w-3 h-3 rounded-full ${cfg.color}`} />
        {cfg.pulse && (
          <motion.div
            animate={{ scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute w-3 h-3 rounded-full ${cfg.color}`}
          />
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900 dark:text-white">{cfg.label}</span>
        {statusMessage && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{statusMessage}</span>
        )}
        {estimatedAvailableAt && status !== 'disponible' && (
          <span className="text-xs text-gray-400 dark:text-gray-500">Disponible vers {estimatedAvailableAt}</span>
        )}
      </div>
    </div>
  );
}
