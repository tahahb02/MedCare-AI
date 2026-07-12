import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Lightbulb, Target, Trophy, Plus, CheckCircle, TrendingUp, BookOpen, Flame, Quote } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';

const motivationalQuotes = [
  { text: 'La santé n\'est pas une condition de la vie, c\'est le culte de la vie.', author: 'Marcus Garvey' },
  { text: 'Chaque pas vers une vie plus saine est un pas vers le bonheur.', author: 'Inconnu' },
  { text: 'Votre corps est le temple. Prenez-en soin.', author: 'Proverbe' },
  { text: 'La prévention est mille fois supérieure à la guérison.', author: 'Proverbe' },
  { text: 'Le mouvement est la vie. Bougez, respirez, vivez.', author: 'Inconnu' },
];

const weeklyTips = [
  { title: 'Hydratation', desc: 'Buvez au moins 2L d\'eau par jour pour maintenir une bonne hydratation.', color: 'from-blue-500 to-blue-600' },
  { title: 'Sommeil', desc: 'Dormez 7-8h par nuit et gardez des horaires réguliers.', color: 'from-indigo-500 to-purple-600' },
  { title: 'Activité physique', desc: 'Au moins 30 minutes d\'activité modérée chaque jour.', color: 'from-green-500 to-emerald-600' },
  { title: 'Alimentation', desc: 'Mangez 5 fruits et légumes par jour minimum.', color: 'from-orange-500 to-red-500' },
  { title: 'Stress', desc: 'Pratiquez la méditation ou la respiration profonde 10 minutes/jour.', color: 'from-pink-500 to-rose-500' },
];

export default function HealthCoaching() {
  const queryClient = useQueryClient();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalUnit, setGoalUnit] = useState('');

  const quoteIndex = new Date().getDay() % motivationalQuotes.length;
  const tipIndex = new Date().getDay() % weeklyTips.length;

  const { data, isLoading } = useQuery({
    queryKey: ['patient-coaching'],
    queryFn: async () => { const { data } = await api.get('/coaching'); return data; },
  });

  const addGoalMutation = useMutation({
    mutationFn: async () => { const { data } = await api.post('/coaching/goals', { name: goalTitle, target: goalTarget, unit: goalUnit }); return data; },
    onSuccess: () => { queryClient.invalidateQueries('patient-coaching'); toast.success('Objectif créé !'); setShowGoalForm(false); setGoalTitle(''); setGoalTarget(''); setGoalUnit(''); },
    onError: () => toast.error('Erreur'),
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, progress }) => { const { data } = await api.put(`/coaching/goals/${id}`, { progress }); return data; },
    onSuccess: () => queryClient.invalidateQueries('patient-coaching'),
    onError: () => toast.error('Erreur'),
  });

  const recommendations = data?.recommendations || [];
  const articles = data?.articles || [];
  const goals = data?.goals || [];
  const challenges = data?.challenges || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Lightbulb size={24} className="text-medcare-amber" /> Coaching Santé</h1>
        <p className="text-gray-500 dark:text-dark-text text-sm">Vos recommandations personnalisées</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-medcare-purple to-medcare-indigo rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-3 right-3 opacity-20"><Quote size={80} /></div>
          <h3 className="text-sm font-medium opacity-80 mb-2">Citation du jour</h3>
          <p className="text-lg font-medium leading-relaxed mb-2">"{motivationalQuotes[quoteIndex].text}"</p>
          <p className="text-sm opacity-60">— {motivationalQuotes[quoteIndex].author}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`bg-gradient-to-br ${weeklyTips[tipIndex].color} rounded-2xl p-6 text-white relative overflow-hidden`}>
          <div className="absolute top-3 right-3 opacity-20"><Lightbulb size={80} /></div>
          <h3 className="text-sm font-medium opacity-80 mb-2">Conseil de la semaine</h3>
          <p className="text-lg font-medium leading-relaxed mb-1">{weeklyTips[tipIndex].title}</p>
          <p className="text-sm opacity-80">{weeklyTips[tipIndex].desc}</p>
        </motion.div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32"><div className="w-8 h-8 border-4 border-medcare-amber border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <>
          {recommendations.length > 0 && (
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-medcare-green" /> Recommandations personnalisées</h3>
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-medcare-green/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lightbulb size={16} className="text-medcare-green" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{rec.title}</p>
                      <p className="text-xs text-gray-500 dark:text-dark-text mt-0.5">{rec.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {challenges.length > 0 && (
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Flame size={18} className="text-orange-500" /> Défis actifs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges.map((ch, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-dark-bg rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{ch.title}</p>
                      <span className="text-xs text-gray-400">{ch.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-gradient-to-r from-medcare-purple to-medcare-indigo rounded-full transition-all duration-500" style={{ width: `${ch.progress || 0}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-400">{ch.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Target size={18} className="text-medcare-blue" /> Mes objectifs</h3>
              <button onClick={() => setShowGoalForm(!showGoalForm)} className="px-3 py-1.5 rounded-lg bg-medcare-blue text-white text-xs font-medium flex items-center gap-1 hover:bg-medcare-blue/90 transition-colors">
                <Plus size={14} /> Nouvel objectif
              </button>
            </div>
            {showGoalForm && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 p-4 bg-gray-50 dark:bg-dark-bg rounded-xl">
                <input type="text" value={goalTitle} onChange={e => setGoalTitle(e.target.value)} placeholder="Titre de l'objectif" className="px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm" />
                <input type="text" value={goalTarget} onChange={e => setGoalTarget(e.target.value)} placeholder="Objectif (nombre)" className="px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm" />
                <div className="flex gap-2">
                  <input type="text" value={goalUnit} onChange={e => setGoalUnit(e.target.value)} placeholder="Unité" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm" />
                  <button onClick={() => addGoalMutation.mutate()} disabled={!goalTitle || addGoalMutation.isPending} className="px-3 py-2 rounded-lg bg-medcare-blue text-white text-sm font-medium hover:bg-medcare-blue/90 disabled:opacity-50 transition-colors">OK</button>
                </div>
              </motion.div>
            )}
            {goals.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Aucun objectif. Créez-en un !</p>
            ) : (
              <div className="space-y-3">
                {goals.map((goal, i) => {
                  const pct = goal.target > 0 ? Math.min(100, Math.round(((goal.progress || 0) / goal.target) * 100)) : 0;
                  return (
                    <div key={goal._id || i} className="p-4 bg-gray-50 dark:bg-dark-bg rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{goal.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{goal.progress || 0} / {goal.target} {goal.unit}</span>
                          {pct >= 100 && <Trophy size={14} className="text-medcare-amber" />}
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-gradient-to-r from-medcare-amber to-orange-500' : 'bg-gradient-to-r from-medcare-blue to-medcare-purple'}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {articles.length > 0 && (
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><BookOpen size={18} className="text-medcare-purple" /> Articles santé</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {articles.map((article, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 bg-gray-50 dark:bg-dark-bg rounded-xl hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-full h-3 bg-gray-200 dark:border-dark-border rounded-lg mb-3 flex items-center justify-center"><BookOpen size={20} className="text-gray-300" /></div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">{article.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-dark-text line-clamp-2">{article.summary}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
