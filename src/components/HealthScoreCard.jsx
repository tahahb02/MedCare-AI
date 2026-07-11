import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { healthScoreColor, healthScoreBg } from '../utils/helpers';

export default function HealthScoreCard({ score = 75, previousScore, trajectory = 'stable', showDetails = true }) {
  const trendIcon = trajectory === 'amélioration' ? TrendingUp : trajectory === 'dégradation' ? TrendingDown : Minus;
  const TrendIcon = trendIcon;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Score Santé</h3>
        <div className={`flex items-center gap-1 text-sm ${healthScoreColor(score)}`}>
          <TrendIcon size={16} />
          <span className="capitalize">{trajectory}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="35" fill="none" stroke="#e5e7eb" strokeWidth="6" className="dark:stroke-dark-border" />
            <circle cx="40" cy="40" r="35" fill="none" strokeWidth="6" strokeDasharray={`${(score / 100) * 220} 220`} strokeLinecap="round" className={healthScoreBg(score)} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${healthScoreColor(score)}`}>{score}</span>
          </div>
        </div>

        {showDetails && (
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-dark-text">Activité physique</span>
              <span className="font-medium text-gray-900 dark:text-white">82</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-dark-text">Sommeil</span>
              <span className="font-medium text-gray-900 dark:text-white">70</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-dark-text">Adhérence médicaments</span>
              <span className="font-medium text-gray-900 dark:text-white">90</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
