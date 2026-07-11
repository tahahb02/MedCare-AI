import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, ChevronUp, Stethoscope, Activity } from 'lucide-react';
import UrgencyBadge from './UrgencyBadge';

const riskColors = {
  low: 'bg-green-500',
  moderate: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-600',
};

const riskTextColors = {
  low: 'text-green-600 dark:text-green-400',
  moderate: 'text-yellow-600 dark:text-yellow-400',
  high: 'text-orange-600 dark:text-orange-400',
  critical: 'text-red-600 dark:text-red-400',
};

const riskLabels = {
  low: 'Faible',
  moderate: 'Modéré',
  high: 'Élevé',
  critical: 'Critique',
};

export default function ClinicalDecisionCard({ result }) {
  const { riskScore = 0, riskLevel = 'low', recommendations = [], differentialDiagnoses = [] } = result || {};
  const [expandedRecs, setExpandedRecs] = useState(false);
  const [expandedDiff, setExpandedDiff] = useState(false);

  const barColor = riskColors[riskLevel] || riskColors.low;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity size={18} className="text-primary-500" />
          Décision clinique
        </h3>
        <span className={`text-sm font-bold ${riskTextColors[riskLevel]}`}>{riskScore}%</span>
      </div>

      <div className="space-y-1.5">
        <div className="w-full h-2.5 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${riskScore}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${barColor}`}
          />
        </div>
        <div className="flex justify-end">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskTextColors[riskLevel]} bg-opacity-10`}>
            Risque {riskLabels[riskLevel] || riskLevel}
          </span>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div>
          <button onClick={() => setExpandedRecs(!expandedRecs)} className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 w-full justify-between">
            <span className="flex items-center gap-2">
              <Stethoscope size={16} />
              Recommandations ({recommendations.length})
            </span>
            {expandedRecs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <AnimatePresence>
            {expandedRecs && (
              <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-2 space-y-1.5">
                {recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-dark-border/50 rounded-lg p-2.5">
                    <AlertTriangle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                    <span>{typeof rec === 'string' ? rec : rec.text}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}

      {differentialDiagnoses.length > 0 && (
        <div>
          <button onClick={() => setExpandedDiff(!expandedDiff)} className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 w-full justify-between">
            <span>Diagnostic différentiel ({differentialDiagnoses.length})</span>
            {expandedDiff ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <AnimatePresence>
            {expandedDiff && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-2 space-y-2">
                {differentialDiagnoses.map((dx, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{dx.name}</span>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{dx.probability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${dx.probability}%` }} />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
