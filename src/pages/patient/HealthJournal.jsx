import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Smile, Zap, Moon, Droplets, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';

export default function HealthJournal() {
  const queryClient = useQueryClient();
  const [mood, setMood] = useState(3);
  const [painLevel, setPainLevel] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [sleepHours, setSleepHours] = useState(7);
  const [waterIntake, setWaterIntake] = useState(4);
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data } = useQuery({ queryKey: ['patient-symptoms'], queryFn: async () => { const { data } = await api.get('/symptoms'); return data; } });

  const quickLogMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/symptoms/quick-log', { quickLog: { mood, painLevel, energyLevel }, sleepHours, waterIntake, notes });
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries('patient-symptoms'); toast.success('Sauvegardé !'); setShowForm(false); setNotes(''); },
    onError: () => toast.error('Erreur')
  });

  const moodEmojis = ['😞', '😕', '😐', '🙂', '😊'];
  const energyEmojis = ['😫', '😔', '😐', '😊', '💪'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><BookOpen size={24} className="text-medcare-green" /> Journal Santé</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2.5 rounded-xl bg-medcare-green text-white text-sm font-medium flex items-center gap-2"><Plus size={16} /> Saisie rapide</button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">Humeur</label>
              <div className="flex gap-2">{[1,2,3,4,5].map(m => <button key={m} onClick={() => setMood(m)} className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${mood === m ? 'bg-medcare-green/20 scale-110 ring-2 ring-medcare-green' : 'bg-gray-50 dark:bg-dark-bg hover:bg-gray-100'}`}>{moodEmojis[m-1]}</button>)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">Douleur: {painLevel}/10</label>
              <input type="range" min="0" max="10" value={painLevel} onChange={e => setPainLevel(+e.target.value)} className="w-full accent-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">Énergie</label>
              <div className="flex gap-2">{[1,2,3,4,5].map(e => <button key={e} onClick={() => setEnergyLevel(e)} className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${energyLevel === e ? 'bg-medcare-green/20 scale-110 ring-2 ring-medcare-green' : 'bg-gray-50 dark:bg-dark-bg hover:bg-gray-100'}`}>{energyEmojis[e-1]}</button>)}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Heures de sommeil</label><input type="number" min="0" max="24" value={sleepHours} onChange={e => setSleepHours(+e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Verres d'eau</label><input type="number" min="0" max="20" value={waterIntake} onChange={e => setWaterIntake(+e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm" /></div>
          </div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Notes optionnelles..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm mb-4" />
          <button onClick={() => quickLogMutation.mutate()} disabled={quickLogMutation.isPending} className="px-6 py-2.5 rounded-xl bg-medcare-green text-white text-sm font-medium hover:bg-medcare-green/90 disabled:opacity-50">
            {quickLogMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </motion.div>
      )}

      <div className="space-y-3">
        {(data?.logs || []).slice(0, 20).map((log, i) => (
          <motion.div key={log._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(log.date)}</p>
              {log.aiSeverityScore && <span className={`text-xs px-2 py-0.5 rounded-full ${log.aiSeverityScore > 70 ? 'bg-red-100 text-red-700' : log.aiSeverityScore > 40 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>Sévérité: {log.aiSeverityScore}</span>}
            </div>
            <div className="flex items-center gap-4 text-sm">
              {log.quickLog?.mood && <span>Humeur: {moodEmojis[log.quickLog.mood - 1]}</span>}
              {log.quickLog?.painLevel !== undefined && <span>Douleur: {log.quickLog.painLevel}/10</span>}
              {log.quickLog?.energyLevel && <span>Énergie: {energyEmojis[log.quickLog.energyLevel - 1]}</span>}
              {log.sleepHours && <span className="flex items-center gap-1"><Moon size={12} /> {log.sleepHours}h</span>}
              {log.waterIntake && <span className="flex items-center gap-1"><Droplets size={12} /> {log.waterIntake}c</span>}
            </div>
            {log.notes && <p className="text-xs text-gray-500 dark:text-dark-text mt-2">{log.notes}</p>}
          </motion.div>
        ))}
        {(!data?.logs || data.logs.length === 0) && <div className="text-center py-12"><BookOpen size={48} className="mx-auto text-gray-300 mb-3" /><p className="text-sm text-gray-400">Commencez votre journal santé en faisant une saisie rapide</p></div>}
      </div>
    </div>
  );
}
