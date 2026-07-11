import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const tierStyles = {
  gold: 'from-yellow-400 to-amber-500 shadow-yellow-200 dark:shadow-yellow-900/40',
  silver: 'from-gray-300 to-gray-400 shadow-gray-200 dark:shadow-gray-700/40',
  bronze: 'from-orange-300 to-orange-500 shadow-orange-200 dark:shadow-orange-900/40',
};

export default function GamificationBadge({ badge }) {
  const { name, description, icon: Icon, earned, earnedAt, tier = 'gold' } = badge;
  const gradient = earned ? tierStyles[tier] || tierStyles.gold : '';

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.08 }}
      className="group relative flex flex-col items-center"
    >
      <div
        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-shadow
          ${earned
            ? `bg-gradient-to-br ${gradient} shadow-lg`
            : 'bg-gray-200 dark:bg-dark-border'
          }`}
      >
        {earned && Icon ? (
          <Icon size={28} className="text-white drop-shadow" />
        ) : (
          <Lock size={24} className="text-gray-400 dark:text-gray-500" />
        )}
        {earned && earnedAt && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-dark-card" />
        )}
      </div>

      <span className={`mt-2 text-xs font-medium text-center max-w-[80px] leading-tight ${earned ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
        {name}
      </span>

      <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10 text-center">
        <p className="font-semibold">{name}</p>
        <p className="text-gray-300 mt-0.5">{description}</p>
        {earned && earnedAt && (
          <p className="text-green-400 mt-1 text-[10px]">Obtenu le {earnedAt}</p>
        )}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
      </div>
    </motion.div>
  );
}
