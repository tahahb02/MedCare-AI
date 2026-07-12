import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, ChevronRight, ChevronLeft, Check, Copy, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const step1Schema = z.object({ name: z.string().min(2, 'Nom requis'), email: z.string().email('Email invalide'), phone: z.string().optional() });
const step2Schema = z.object({ dateOfBirth: z.string().optional(), gender: z.string().optional(), bloodType: z.string().optional(), address: z.string().optional(), city: z.string().optional() });
const step3Schema = z.object({ emergencyName: z.string().optional(), emergencyPhone: z.string().optional(), emergencyRelationship: z.string().optional(), insuranceProvider: z.string().optional(), insuranceNumber: z.string().optional() });
const step4Schema = z.object({ primaryDoctorId: z.string().optional() });
const step5Schema = z.object({ planType: z.string().optional(), amount: z.coerce.number().optional(), paymentMethod: z.string().optional() });

export default function CreatePatient() {
  const [step, setStep] = useState(1);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const schemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema];

  const form = useForm({ resolver: zodResolver(schemas[step - 1]), defaultValues: { name: '', email: '', phone: '', dateOfBirth: '', gender: '', bloodType: '', address: '', city: '', emergencyName: '', emergencyPhone: '', emergencyRelationship: '', insuranceProvider: '', insuranceNumber: '', primaryDoctorId: '', planType: 'mensuel', amount: 0, paymentMethod: 'especes' } });

  const { data: doctorsData, isLoading: doctorsLoading, error: doctorsError } = useQuery({ queryKey: ['admin-doctors'], queryFn: async () => { const { data } = await api.get('/admin/doctors'); return data; }, enabled: step === 4, retry: 1 });

  const createMutation = useMutation({ mutationFn: async (allValues) => {
    const payload = { name: allValues.name, email: allValues.email, phone: allValues.phone,
      dateOfBirth: allValues.dateOfBirth, gender: allValues.gender, bloodType: allValues.bloodType, address: allValues.address, city: allValues.city,
      emergencyContact: { name: allValues.emergencyName, phone: allValues.emergencyPhone, relationship: allValues.emergencyRelationship },
      insuranceProvider: allValues.insuranceProvider, insuranceNumber: allValues.insuranceNumber, primaryDoctorId: allValues.primaryDoctorId || undefined,
      subscription: allValues.planType ? { planType: allValues.planType, amount: allValues.amount || 0, paymentMethod: allValues.paymentMethod } : undefined
    };
    const { data } = await api.post('/admin/patients', payload);
    return data;
  }, onSuccess: (data) => { setCreated(data); queryClient.invalidateQueries({ queryKey: ['admin-patients'] }); toast.success('Patient créé avec succès !'); }, onError: (err) => toast.error(err.response?.data?.message || 'Erreur') });

  const nextStep = async () => { const valid = await form.trigger(); if (valid) setStep(s => Math.min(5, s + 1)); };
  const prevStep = () => setStep(s => Math.max(1, s - 1));
  const onSubmit = () => { const allValues = form.getValues(); createMutation.mutate(allValues); };

  const copyCredentials = () => {
    navigator.clipboard.writeText(`Email: ${created.user.email}\nMot de passe: ${created.temporaryPassword}`);
    setCopied(true);
    toast.success('Identifiants copiés !');
  };

  const steps = ['Identité', 'Informations', 'Urgence & Assurance', 'Médecin', 'Abonnement'];

  if (created) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto mt-8">
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-medcare-green/10 flex items-center justify-center mb-4">
            <CheckCircle className="text-medcare-green" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Patient créé !</h2>
          <p className="text-gray-500 dark:text-dark-text text-sm mb-6">Remettez ces identifiants au patient. Il devra changer son mot de passe à la première connexion.</p>
          <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4 text-left space-y-2 mb-4">
            <p className="text-sm"><span className="font-medium text-gray-700 dark:text-dark-text">Nom :</span> <span className="text-gray-900 dark:text-white">{created.user.name}</span></p>
            <p className="text-sm"><span className="font-medium text-gray-700 dark:text-dark-text">Email :</span> <span className="text-gray-900 dark:text-white">{created.user.email}</span></p>
            <p className="text-sm"><span className="font-medium text-gray-700 dark:text-dark-text">Mot de passe :</span> <span className="text-gray-900 dark:text-white font-mono bg-medcare-purple/10 px-2 py-0.5 rounded">{created.temporaryPassword}</span></p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 mb-6">
            <p className="text-xs text-amber-700 dark:text-amber-300">Le patient sera redirigé vers une page de changement de mot de passe lors de sa première connexion.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={copyCredentials} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg text-sm font-medium flex items-center justify-center gap-2">
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copié !' : 'Copier les identifiants'}
            </button>
            <button onClick={() => navigate('/admin/patients')} className="flex-1 py-2.5 rounded-xl bg-medcare-purple text-white text-sm font-medium hover:bg-medcare-purple/90">Voir les patients</button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><UserPlus size={24} className="text-medcare-purple" /> Créer un patient</h1>

      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${i + 1 <= step ? 'bg-medcare-purple text-white' : 'bg-gray-100 dark:bg-dark-bg text-gray-400'}`}>
              {i + 1 < step ? <Check size={14} /> : i + 1}
            </div>
            {i < 4 && <div className={`flex-1 h-0.5 ${i + 1 < step ? 'bg-medcare-purple' : 'bg-gray-200 dark:bg-dark-border'}`}></div>}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{steps[step - 1]}</h3>
        <form onSubmit={form.handleSubmit(step === 5 ? onSubmit : nextStep)} className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {step === 1 && (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Nom complet *</label><input {...form.register('name')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Email *</label><input type="email" {...form.register('email')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Téléphone</label><input {...form.register('phone')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none" /></div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Date de naissance</label><input type="date" {...form.register('dateOfBirth')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Sexe</label><select {...form.register('gender')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm"><option value="">Sélectionner</option><option value="homme">Homme</option><option value="femme">Femme</option><option value="autre">Autre</option></select></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Groupe sanguin</label><select {...form.register('bloodType')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm"><option value="">Sélectionner</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Adresse</label><input {...form.register('address')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Ville</label><input {...form.register('city')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none" /></div>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-dark-text uppercase">Contact d'urgence</p>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Nom</label><input {...form.register('emergencyName')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Téléphone</label><input {...form.register('emergencyPhone')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Lien de parenté</label><input {...form.register('emergencyRelationship')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none" /></div>
                  <p className="text-xs font-medium text-gray-500 dark:text-dark-text uppercase pt-2">Assurance</p>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Fournisseur</label><input {...form.register('insuranceProvider')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">N° Assurance</label><input {...form.register('insuranceNumber')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none" /></div>
                </div>
              )}
              {step === 4 && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Médecin traitant</label>
                  {doctorsLoading ? (
                    <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
                      <div className="w-4 h-4 border-2 border-medcare-purple border-t-transparent rounded-full animate-spin"></div>
                      Chargement des médecins...
                    </div>
                  ) : doctorsError ? (
                    <div className="space-y-2">
                      <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl p-3">Impossible de charger la liste des médecins. Vous pouvez continuer sans assigner de médecin.</p>
                      <select {...form.register('primaryDoctorId')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm">
                        <option value="">Aucun médecin assigné</option>
                      </select>
                    </div>
                  ) : (
                    <>
                      <select {...form.register('primaryDoctorId')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm">
                        <option value="">Aucun médecin assigné</option>
                        {(doctorsData?.doctors || []).map((doc) => (
                          <option key={doc._id} value={doc._id}>
                            Dr. {doc.name} {doc.specializations?.length > 0 ? `— ${doc.specializations[0].name}` : ''} {doc.currentStatus === 'disponible' ? '✓' : `(${doc.currentStatus})`}
                          </option>
                        ))}
                      </select>
                      {doctorsData?.doctors?.length === 0 && (
                        <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">Aucun médecin disponible. Créez un compte médecin d'abord.</p>
                      )}
                    </>
                  )}
                </div>
              )}
              {step === 5 && (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Type d'abonnement</label><select {...form.register('planType')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm"><option value="mensuel">Mensuel</option><option value="trimestriel">Trimestriel</option><option value="semestre">Semestre</option><option value="annuel">Annuel</option></select></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Montant (MAD)</label><input type="number" {...form.register('amount')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Mode de paiement</label><select {...form.register('paymentMethod')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm"><option value="especes">Espèces</option><option value="virement">Virement</option><option value="cartebancaire">Carte bancaire</option><option value="mobile">Mobile</option></select></div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between pt-4">
            {step > 1 && <button type="button" onClick={prevStep} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-text text-sm font-medium flex items-center gap-1"><ChevronLeft size={16} /> Retour</button>}
            <div className="flex-1"></div>
            <button type="submit" disabled={createMutation.isPending} className="px-6 py-2.5 rounded-xl bg-medcare-purple text-white text-sm font-medium hover:bg-medcare-purple/90 disabled:opacity-50 flex items-center gap-1">
              {step === 5 ? (createMutation.isPending ? 'Création...' : 'Créer le patient') : <><span>Suivant</span> <ChevronRight size={16} /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
