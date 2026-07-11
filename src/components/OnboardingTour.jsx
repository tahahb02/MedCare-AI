import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, SkipForward } from 'lucide-react';

const defaultSteps = [
  { target: '#dashboard', title: 'Tableau de bord', description: 'Bienvenue ! Votre tableau de bord affiche vos informations de santé essentielles.' },
  { target: '#appointments', title: 'Rendez-vous', description: 'Gérez vos rendez-vous médicaux et consultez votre historique.' },
  { target: '#documents', title: 'Documents médicaux', description: 'Téléversez et consultez vos documents médicaux en toute sécurité.' },
  { target: '#health-log', title: 'Journal de santé', description: 'Enregistrez quotidiennement votre humeur, douleur et énergie.' },
  { target: '#profile', title: 'Votre profil', description: 'Complétez votre profil pour des recommandations personnalisées.' },
];

export default function OnboardingTour({ steps = defaultSteps, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];
  if (!step) return null;

  const next = () => {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
    else onComplete?.();
  };

  const skip = () => onSkip?.();

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/40" />

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] bg-white dark:bg-dark-card rounded-2xl shadow-2xl p-6 space-y-4 z-10"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-primary-500">Étape {currentStep + 1}/{steps.length}</span>
            <button onClick={skip} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{step.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentStep ? 'bg-primary-500' : i < currentStep ? 'bg-primary-300 dark:bg-primary-700' : 'bg-gray-200 dark:bg-dark-border'}`} />
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={skip} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                <SkipForward size={14} /> Passer
              </button>
              <button onClick={next} className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary-500 text-xs font-medium text-white hover:bg-primary-600 transition-colors">
                {currentStep < steps.length - 1 ? 'Suivant' : 'Commencer'} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
