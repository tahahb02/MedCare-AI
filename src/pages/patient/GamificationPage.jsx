import { useQuery } from '@tanstack/react-query';
import { Trophy, Star, Flame, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

const LEVELS = [
  { name: 'Débutant', min: 0, max: 100, color: 'from-gray-400 to-gray-500' },
  { name: 'Acteur Santé', min: 101, max: 500, color: 'from-medcare-green to-emerald-600' },
  { name: 'Champion Santé', min: 501, max: 1500, color: 'from-medcare-blue to-blue-600' },
  { name: 'Expert Bien-être', min: 1501, max: 5000, color: 'from-medcare-purple to-indigo-600' },
  { name: 'Légende MedCare', min: 5001, max: Infinity, color: 'from-medcare-gold to-orange-500' },
];

const BADGES = [
  { name: 'Premier pas', icon: '🎯', desc: 'Première saisie quotidienne', pts: 10 },
  { name: 'Streak 7 jours', icon: '🔥', desc: '7 jours consécutifs', pts: 50 },
  { name: 'Document uploadé', icon: '📄', desc: 'Premier document uploadé', pts: 15 },
  { name: 'RDV suivi', icon: '✅', desc: 'Premier RDV suivi', pts: 20 },
  { name: 'Hydratation', icon: '💧', desc: '8 verres d\'eau en un jour', pts: 10 },
];

export default function GamificationPage() {
  const { data } = useQuery({ queryKey: ['patient-gamification'], queryFn: async () => { const { data } = await api.get('/patients/gamification'); return data; } });

  const profile = data?.profile;
  const points = profile?.points || 0;
  const level = LEVELS.find(l => points >= l.min && points <= l.max) || LEVELS[0];
  const levelIndex = LEVELS.indexOf(level);
  const nextLevel = LEVELS[levelIndex + 1];
  const progress = nextLevel ? ((points - level.min) / (nextLevel.min - level.min)) * 100 : 100;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Trophy size={24} className="text-medcare-amber" /> Points Fidélité</h1>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`bg-gradient-to-br ${level.color} rounded-2xl p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Niveau actuel</p>
            <p className="text-2xl font-bold">{level.name}</p>
            <p className="text-white/80 text-sm mt-1">{points} points</p>
          </div>
          <div className="text-5xl">{['🌱', '🌿', '🏆', '👑', '⭐'][levelIndex]}</div>
        </div>
        {nextLevel && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/70 mb-1"><span>{level.name}</span><span>{nextLevel.name}</span></div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-white rounded-full" /></div>
            <p className="text-xs text-white/70 mt-1">{nextLevel.min - points} points pour le prochain niveau</p>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 text-center">
          <Flame className="mx-auto text-orange-500 mb-2" size={28} />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.streak?.currentDays || 0}</p>
          <p className="text-sm text-gray-500">Jours consécutifs</p>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 text-center">
          <Target className="mx-auto text-medcare-purple mb-2" size={28} />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.badges?.length || 0}</p>
          <p className="text-sm text-gray-500">Badges obtenus</p>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 text-center">
          <Award className="mx-auto text-medcare-amber mb-2" size={28} />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.pointsHistory?.length || 0}</p>
          <p className="text-sm text-gray-500">Actions réalisées</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Badges disponibles</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {BADGES.map((b, i) => {
            const earned = (profile?.badges || []).some(eb => eb.name === b.name);
            return (
              <motion.div key={b.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className={`bg-white dark:bg-dark-card rounded-2xl border p-4 text-center ${earned ? 'border-medcare-green' : 'border-gray-100 dark:border-dark-border opacity-60'}`}>
                <div className="text-3xl mb-2">{b.icon}</div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{b.name}</p>
                <p className="text-xs text-gray-500">{b.desc}</p>
                <p className="text-xs text-medcare-green mt-1">+{b.pts} pts</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {(profile?.pointsHistory || []).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Historique des points</h2>
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border divide-y divide-gray-50">
            {profile.pointsHistory.slice(-10).reverse().map((h, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-900 dark:text-white">{h.description || h.action}</span>
                <span className="text-sm font-semibold text-medcare-green">+{h.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
