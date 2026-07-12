import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ClipboardList, ArrowLeft, Plus, Trash2, Pill, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const emptyMed = { name: '', genericName: '', dosage: '', unit: 'mg', frequency: '1 fois/jour', times: [], duration: 30, instructions: '', withFood: false, beforeOrAfterMeal: 'indifférent', route: 'oral', sideEffects: [], contraindications: [] };

export default function CreatePrescriptionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ patientId: '', diagnosis: '', notes: '', medications: [{ ...emptyMed }] });

  const { data: patientsData } = useQuery({
    queryKey: ['doctor-patients-list'],
    queryFn: async () => { const { data } = await api.get('/docteurs/patients'); return data; }
  });

  const createMutation = useMutation({
    mutationFn: async (rx) => { const { data } = await api.post('/prescriptions', rx); return data; },
    onSuccess: () => { toast.success('Prescription créée !'); queryClient.invalidateQueries('doctor-prescriptions'); navigate('/medecin/prescriptions'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur')
  });

  const updateMed = (index, field, value) => {
    const meds = [...form.medications];
    meds[index] = { ...meds[index], [field]: value };
    setForm({ ...form, medications: meds });
  };

  const addMed = () => setForm({ ...form, medications: [...form.medications, { ...emptyMed }] });
  const removeMed = (i) => setForm({ ...form, medications: form.medications.filter((_, idx) => idx !== i) });

  const handleSubmit = () => {
    if (!form.patientId) { toast.error('Sélectionnez un patient.'); return; }
    if (!form.diagnosis) { toast.error('Entrez un diagnostic.'); return; }
    if (form.medications.some(m => !m.name || !m.dosage)) { toast.error('Remplissez tous les médicaments.'); return; }
    createMutation.mutate(form);
  };

  const patients = patientsData?.patients || [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><ClipboardList size={24} className="text-medcare-blue" /> Nouvelle Prescription</h1>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">Patient *</label>
          <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm">
            <option value="">Sélectionner un patient</option>
            {patients.map(p => (
              <option key={p.userId?._id || p._id} value={p.userId?._id || p._id}>{p.userId?.name || p.name || 'Patient'}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">Diagnostic *</label>
          <input type="text" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="Ex: Hypertension artérielle" required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-medcare-blue outline-none text-sm" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Pill size={18} className="text-medcare-blue" /> Médicaments</h3>
            <button onClick={addMed} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-medcare-blue/10 text-medcare-blue text-xs font-medium hover:bg-medcare-blue/20 transition-colors"><Plus size={14} /> Ajouter</button>
          </div>

          {form.medications.map((med, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-gray-50 dark:bg-dark-bg rounded-xl space-y-3 relative">
              {form.medications.length > 1 && (
                <button onClick={() => removeMed(i)} className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nom du médicament *</label>
                  <input type="text" value={med.name} onChange={(e) => updateMed(i, 'name', e.target.value)} placeholder="Ex: Amlodipine" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-900 dark:text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Dosage *</label>
                  <input type="text" value={med.dosage} onChange={(e) => updateMed(i, 'dosage', e.target.value)} placeholder="5" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-900 dark:text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Unité</label>
                  <select value={med.unit} onChange={(e) => updateMed(i, 'unit', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-900 dark:text-white outline-none">
                    <option value="mg">mg</option><option value="µg">µg</option><option value="g">g</option><option value="ml">ml</option><option value="UI">UI</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Fréquence</label>
                  <select value={med.frequency} onChange={(e) => updateMed(i, 'frequency', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-900 dark:text-white outline-none">
                    <option>1 fois/jour</option><option>2 fois/jour</option><option>3 fois/jour</option><option>4 fois/jour</option><option>À la demande</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Durée (jours)</label>
                  <input type="number" value={med.duration} onChange={(e) => updateMed(i, 'duration', parseInt(e.target.value) || 30)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-900 dark:text-white outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Voie</label>
                  <select value={med.route} onChange={(e) => updateMed(i, 'route', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-900 dark:text-white outline-none">
                    <option value="oral">Oral</option><option value="topique">Topique</option><option value="injectable">Injectable</option><option value="inhalation">Inhalation</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Instructions</label>
                <input type="text" value={med.instructions} onChange={(e) => updateMed(i, 'instructions', e.target.value)} placeholder="Ex: À prendre pendant le repas" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-900 dark:text-white outline-none" />
              </div>
            </motion.div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">Notes cliniques</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Instructions supplémentaires..." className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-medcare-blue outline-none text-sm resize-none" />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSubmit} disabled={createMutation.isPending} className="px-6 py-2.5 rounded-xl bg-medcare-blue text-white text-sm font-medium hover:bg-medcare-blue/90 disabled:opacity-50 transition-colors flex items-center gap-2">
          {createMutation.isPending ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Création...</> : <><CheckCircle size={16} /> Créer la prescription</>}
        </button>
      </div>
    </div>
  );
}
