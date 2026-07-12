import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Brain, Plus, X, AlertTriangle, CheckCircle, ShieldAlert, Pill, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const severityConfig = {
  mineure: { label: 'Mineure', color: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300', icon: CheckCircle },
  moderee: { label: 'Modérée', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300', icon: AlertTriangle },
  severe: { label: 'Sévère', color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300', icon: ShieldAlert },
  contreindication: { label: 'Contre-indication', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300', icon: AlertTriangle },
};

export default function DrugInteractions() {
  const [drugs, setDrugs] = useState([]);
  const [drugInput, setDrugInput] = useState('');
  const [results, setResults] = useState(null);

  const checkMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/docteurs/drug-interactions', { drugs });
      return data;
    },
    onSuccess: (data) => { setResults(data); toast.success(`${(data?.interactions || []).length} interaction(s) trouvée(s)`); },
    onError: () => toast.error('Erreur lors de la vérification'),
  });

  const addDrug = () => {
    const name = drugInput.trim();
    if (!name) return;
    if (drugs.map(d => d.toLowerCase()).includes(name.toLowerCase())) {
      toast.error('Médicament déjà ajouté');
      return;
    }
    setDrugs([...drugs, name]);
    setDrugInput('');
  };

  const removeDrug = (index) => setDrugs(drugs.filter((_, i) => i !== index));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addDrug(); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Brain size={24} className="text-medcare-blue" /> Interactions Médicamenteuses</h1>
        <p className="text-gray-500 dark:text-dark-text text-sm">Vérifiez les interactions entre médicaments</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Ajouter des médicaments</h3>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Pill size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={drugInput}
              onChange={e => setDrugInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nom du médicament..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm"
            />
          </div>
          <button onClick={addDrug} className="px-4 py-2.5 rounded-xl bg-medcare-blue text-white text-sm font-medium flex items-center gap-1 hover:bg-medcare-blue/90 transition-colors">
            <Plus size={16} /> Ajouter
          </button>
        </div>
        {drugs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {drugs.map((drug, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-medcare-blue/10 text-medcare-blue text-sm font-medium">
                {drug}
                <button onClick={() => removeDrug(i)} className="hover:text-red-500 transition-colors"><X size={14} /></button>
              </span>
            ))}
          </div>
        )}
        <button onClick={() => checkMutation.mutate()} disabled={drugs.length < 2 || checkMutation.isPending} className="px-6 py-2.5 rounded-xl bg-medcare-blue text-white text-sm font-medium hover:bg-medcare-blue/90 disabled:opacity-50 transition-colors flex items-center gap-2">
          <Search size={16} /> {checkMutation.isPending ? 'Vérification...' : 'Vérifier les interactions'}
        </button>
      </motion.div>

      {checkMutation.isPending && (
        <div className="flex items-center justify-center h-32"><div className="w-8 h-8 border-4 border-medcare-blue border-t-transparent rounded-full animate-spin"></div></div>
      )}

      {results && !checkMutation.isPending && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Résultats</h3>
          {(results.interactions || []).length === 0 ? (
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-8 text-center">
              <CheckCircle size={48} className="mx-auto text-green-400 mb-3" />
              <p className="text-gray-700 dark:text-white font-medium">Aucune interaction détectée</p>
              <p className="text-sm text-gray-400 mt-1">Ces médicaments semblent compatibles</p>
            </div>
          ) : (
            (results.interactions || []).map((interaction, i) => {
              const sev = severityConfig[interaction.severity] || severityConfig.mineure;
              const SevIcon = sev.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sev.color}`}>
                      <SevIcon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{interaction.drug1} + {interaction.drug2}</h4>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${sev.color}`}>{sev.label}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-dark-text mb-2">{interaction.description}</p>
                      {interaction.recommendation && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-sm text-blue-700 dark:text-blue-300">
                          <strong>Recommandation :</strong> {interaction.recommendation}
                        </div>
                      )}
                      {interaction.alternatives && interaction.alternatives.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-500 dark:text-dark-text mb-1">Alternatives suggérées :</p>
                          <div className="flex flex-wrap gap-1.5">
                            {interaction.alternatives.map((alt, j) => (
                              <span key={j} className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 text-xs font-medium">{alt}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}
    </div>
  );
}
