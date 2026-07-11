import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Zap, Battery, Send, CheckCircle2 } from 'lucide-react';

export default function QuickHealthLog({ onSubmit }) {
  const [mood, setMood] = useState(3);
  const [pain, setPain] = useState(0);
  const [energy, setEnergy] = useState(3);
  const [submitted, setSubmitted] = useState(false);

  const moodLabels = ['', 'Très bas', 'Bas', 'Neutre', 'Bon', 'Très bon'];
  const energyLabels = ['', 'Épuisé', 'Fatigué', 'Normal', 'Énergique', 'Très énergique'];

  const handleSubmit = () => {
    onSubmit?.({ mood, pain, energy });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setMood(3);
      setPain(0);
      setEnergy(3);
    }, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Journal rapide</h3>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex flex-col items-center py-4 gap-2">
            <CheckCircle2 size={36} className="text-green-500" />
            <p className="text-sm font-medium text-green-600 dark:text-green-400">Enregistré !</p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                  <Smile size={14} /> Humeur
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">{moodLabels[mood]}</span>
              </div>
              <input type="range" min={1} max={5} value={mood} onChange={(e) => setMood(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none bg-gray-200 dark:bg-dark-border accent-primary-500 cursor-pointer" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                  <Zap size={14} /> Douleur
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">{pain}/10</span>
              </div>
              <input type="range" min={0} max={10} value={pain} onChange={(e) => setPain(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none bg-gray-200 dark:bg-dark-border accent-red-500 cursor-pointer" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                  <Battery size={14} /> Énergie
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">{energyLabels[energy]}</span>
              </div>
              <input type="range" min={1} max={5} value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none bg-gray-200 dark:bg-dark-border accent-yellow-500 cursor-pointer" />
            </div>

            <button onClick={handleSubmit} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors">
              <Send size={14} /> Enregistrer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
