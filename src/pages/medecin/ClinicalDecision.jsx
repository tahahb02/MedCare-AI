import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Brain, Send, AlertTriangle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function ClinicalDecision() {
  const [patientId, setPatientId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [analyses, setAnalyses] = useState('');
  const [history, setHistory] = useState('');
  const [medications, setMedications] = useState('');

  const analyzeMutation = useMutation({
    mutationFn: async () => { const { data } = await api.post('/docteurs/clinical-decision', { patientId, symptoms: symptoms.split(',').map(s => s.trim()).filter(Boolean), analyses, history, medications: medications.split(',').map(m => m.trim()).filter(Boolean) }); return data; },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur')
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Brain size={24} className="text-medcare-blue" /> Aide à la Décision Clinique</h1>

      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-start gap-2 mb-6">
          <Info size={16} className="text-blue-500 mt-0.5" />
          <p className="text-sm text-blue-700 dark:text-blue-400">Cet outil est une aide à la décision. Il ne remplace pas le jugement clinique du médecin.</p>
        </div>

        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">ID Patient (optionnel)</label><input value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-medcare-blue" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Symptômes (séparés par virgule)</label><textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-medcare-blue" placeholder="douleur thoracique, essoufflement, fatigue" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Résultats d'analyses</label><textarea value={analyses} onChange={e => setAnalyses(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-medcare-blue" placeholder="Glycémie: 1.3g/L, Cholestérol: 2.4g/L..." /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Antécédents</label><textarea value={history} onChange={e => setHistory(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-medcare-blue" placeholder="HTA, diabète type 2..." /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Médicaments en cours (séparés par virgule)</label><input value={medications} onChange={e => setMedications(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-medcare-blue" placeholder="Metformine, Amlodipine..." /></div>
        </div>

        <button onClick={() => analyzeMutation.mutate()} disabled={analyzeMutation.isPending || (!symptoms && !analyses)} className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-medcare-blue to-medcare-purple text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
          {analyzeMutation.isPending ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Analyse en cours...</> : <><Send size={16} /> Analyser</>}
        </button>
      </div>

      {analyzeMutation.data && (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Résultat de l'analyse</h3>
          <div className="space-y-3">
            {(analyzeMutation.data?.decision?.result?.recommendations || []).map((r, i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-dark-bg rounded-xl">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{r.title}</p>
                <p className="text-sm text-gray-600 dark:text-dark-text mt-1">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
