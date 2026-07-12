import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, Clock, Stethoscope, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';

export default function CreateAppointmentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ doctorId: '', date: '', time: '09:00', type: 'consultation', urgencyDegree: 'normal', reason: '', symptoms: '', patientNotes: '', location: 'cabinet' });
  const [step, setStep] = useState(1);

  const { data: doctors, isLoading: doctorsLoading, error: doctorsError } = useQuery({
    queryKey: ['doctors-list'],
    queryFn: async () => { const { data } = await api.get('/patients/search'); return data; }
  });

  const doctorList = doctors?.doctors || [];

  const createMutation = useMutation({
    mutationFn: async (appointmentData) => { const { data } = await api.post('/appointments', appointmentData); return data; },
    onSuccess: () => { toast.success('Rendez-vous créé avec succès !'); queryClient.invalidateQueries('patient-appointments'); navigate('/patient/appointments'); },
    onError: (err) => { toast.error(err.response?.data?.message || 'Erreur lors de la création.'); }
  });

  const handleSubmit = () => {
    const dateTime = new Date(`${form.date}T${form.time}:00`);
    const endDate = new Date(dateTime.getTime() + 30 * 60000);
    createMutation.mutate({
      doctorId: form.doctorId,
      date: dateTime,
      endDate,
      duration: 30,
      type: form.type,
      urgencyDegree: form.urgencyDegree,
      reason: form.reason,
      symptoms: form.symptoms ? form.symptoms.split(',').map(s => s.trim()) : [],
      patientNotes: form.patientNotes,
      location: form.location
    });
  };

  const steps = [
    { title: 'Médecin', icon: Stethoscope },
    { title: 'Date & Heure', icon: Calendar },
    { title: 'Détails', icon: AlertTriangle }
  ];

  const canProceed = () => {
    if (step === 1) return form.doctorId;
    if (step === 2) return form.date && form.time;
    return form.reason;
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouveau Rendez-vous</h1>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step > i + 1 ? 'bg-medcare-green text-white' : step === i + 1 ? 'bg-medcare-purple text-white' : 'bg-gray-100 dark:bg-dark-bg text-gray-400'}`}>
              {step > i + 1 ? <CheckCircle size={16} /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${step === i + 1 ? 'text-medcare-purple' : 'text-gray-400'}`}>{s.title}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${step > i + 1 ? 'bg-medcare-green' : 'bg-gray-200 dark:bg-dark-border'}`}></div>}
          </div>
        ))}
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Stethoscope size={18} className="text-medcare-purple" /> Sélectionner un médecin</h3>
            {doctorsLoading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-500">
                <div className="w-5 h-5 border-2 border-medcare-purple border-t-transparent rounded-full animate-spin"></div>
                Chargement des médecins...
              </div>
            ) : doctorsError ? (
              <div className="text-center py-8">
                <p className="text-sm text-red-500 mb-2">Erreur lors du chargement des médecins.</p>
                <button onClick={() => window.location.reload()} className="text-sm text-medcare-purple hover:underline">Réessayer</button>
              </div>
            ) : doctorList.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucun médecin disponible pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {doctorList.map(d => {
                  const doc = d.userId || d;
                  return (
                    <button key={doc._id} onClick={() => setForm({ ...form, doctorId: doc._id })} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${form.doctorId === doc._id ? 'border-medcare-purple bg-medcare-purple/5' : 'border-gray-200 dark:border-dark-border hover:border-gray-300'}`}>
                      <p className="font-medium text-gray-900 dark:text-white">{doc.name || `Dr. ${doc.name}`}</p>
                      <p className="text-sm text-gray-500">{d.specializations?.[0]?.name || d.hospital || 'Médecin'}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Calendar size={18} className="text-medcare-purple" /> Choisir date et heure</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-medcare-purple outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">Heure</label>
              <div className="grid grid-cols-4 gap-2">
                {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                  <button key={t} onClick={() => setForm({ ...form, time: t })} className={`p-2.5 rounded-xl text-sm font-medium transition-all ${form.time === t ? 'bg-medcare-purple text-white' : 'bg-gray-50 dark:bg-dark-bg text-gray-700 dark:text-dark-text hover:bg-gray-100'}`}>{t}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><AlertTriangle size={18} className="text-medcare-purple" /> Détails de la consultation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm">
                  <option value="consultation">Consultation</option>
                  <option value="suivi">Suivi</option>
                  <option value="bilan">Bilan</option>
                  <option value="téléconsultation">Téléconsultation</option>
                  <option value="urgence">Urgence</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">Urgence</label>
                <select value={form.urgencyDegree} onChange={(e) => setForm({ ...form, urgencyDegree: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm">
                  <option value="routine">Routine</option>
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="très_urgent">Très urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">Motif de la consultation *</label>
              <input type="text" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Ex: Contrôle tension, Douleur..." required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-medcare-purple outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">Symptômes (séparés par virgule)</label>
              <input type="text" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} placeholder="Ex: Maux de tête, Fatigue" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-medcare-purple outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">Notes personnelles</label>
              <textarea value={form.patientNotes} onChange={(e) => setForm({ ...form, patientNotes: e.target.value })} rows={3} placeholder="Informations complémentaires..." className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-medcare-purple outline-none text-sm resize-none" />
            </div>
          </div>
        )}
      </motion.div>

      <div className="flex items-center justify-between">
        <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">Précédent</button>
        {step < 3 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="px-6 py-2.5 rounded-xl bg-medcare-purple text-white text-sm font-medium hover:bg-medcare-purple/90 disabled:opacity-50 transition-colors">Suivant</button>
        ) : (
          <button onClick={handleSubmit} disabled={!canProceed() || createMutation.isPending} className="px-6 py-2.5 rounded-xl bg-medcare-green text-white text-sm font-medium hover:bg-medcare-green/90 disabled:opacity-50 transition-colors flex items-center gap-2">
            {createMutation.isPending ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Création...</> : <><CheckCircle size={16} /> Confirmer le RDV</>}
          </button>
        )}
      </div>
    </div>
  );
}
