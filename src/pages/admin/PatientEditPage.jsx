import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User, Heart, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function PatientEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin-patient-detail', id],
    queryFn: async () => { const { data } = await api.get(`/admin/patients/${id}`); return data; }
  });

  useEffect(() => {
    if (data) {
      const p = data.patient || {};
      const prof = data.profile || {};
      setForm({
        name: p.name || '', email: p.email || '', phone: p.phone || '',
        dateOfBirth: prof.dateOfBirth ? new Date(prof.dateOfBirth).toISOString().split('T')[0] : '',
        gender: prof.gender || '', bloodType: prof.bloodType || '',
        address: prof.address || '', city: prof.city || '',
        height: prof.height || '', weight: prof.weight || '',
        emergencyName: prof.emergencyContact?.name || '', emergencyPhone: prof.emergencyContact?.phone || '',
        emergencyRelationship: prof.emergencyContact?.relationship || '',
        insuranceProvider: prof.insuranceProvider || '', insuranceNumber: prof.insuranceNumber || '',
        smokingStatus: prof.smokingStatus || 'non', alcoholConsumption: prof.alcoholConsumption || 'aucun',
        physicalActivityLevel: prof.physicalActivityLevel || 'sédentaire'
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async (formData) => {
      await api.put(`/admin/patients/${id}`, { ...formData });
      const profileData = { dateOfBirth: formData.dateOfBirth, gender: formData.gender, bloodType: formData.bloodType, address: formData.address, city: formData.city, height: formData.height, weight: formData.weight, emergencyContact: { name: formData.emergencyName, phone: formData.emergencyPhone, relationship: formData.emergencyRelationship }, insuranceProvider: formData.insuranceProvider, insuranceNumber: formData.insuranceNumber, smokingStatus: formData.smokingStatus, alcoholConsumption: formData.alcoholConsumption, physicalActivityLevel: formData.physicalActivityLevel };
      await api.put('/patients/profile', profileData);
    },
    onSuccess: () => { toast.success('Patient mis à jour !'); queryClient.invalidateQueries('admin-patients'); navigate('/admin/patients'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur')
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-medcare-purple border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier le Patient</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><User size={18} className="text-medcare-purple" /> Informations personnelles</h3>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nom complet</label>
            <input type="text" value={form.name || ''} onChange={(e) => update('name', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-medcare-purple" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input type="email" value={form.email || ''} onChange={(e) => update('email', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-medcare-purple" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Téléphone</label>
              <input type="text" value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-medcare-purple" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date de naissance</label>
              <input type="date" value={form.dateOfBirth || ''} onChange={(e) => update('dateOfBirth', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-medcare-purple" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sexe</label>
              <select value={form.gender || ''} onChange={(e) => update('gender', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-900 dark:text-white outline-none">
                <option value="">—</option><option value="homme">Homme</option><option value="femme">Femme</option><option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Groupe sanguin</label>
              <select value={form.bloodType || ''} onChange={(e) => update('bloodType', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-900 dark:text-white outline-none">
                <option value="">—</option>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><MapPin size={18} className="text-medcare-green" /> Adresse & Contact urgence</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Adresse</label>
              <input type="text" value={form.address || ''} onChange={(e) => update('address', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-medcare-purple" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Ville</label>
              <input type="text" value={form.city || ''} onChange={(e) => update('city', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-medcare-purple" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Taille (cm)</label>
              <input type="number" value={form.height || ''} onChange={(e) => update('height', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-900 dark:text-white outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Poids (kg)</label>
              <input type="number" value={form.weight || ''} onChange={(e) => update('weight', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-900 dark:text-white outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tabac</label>
              <select value={form.smokingStatus || 'non'} onChange={(e) => update('smokingStatus', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-900 dark:text-white outline-none">
                <option value="non">Non</option><option value="fumer">Fumeur</option><option value="ancien">Ex-fumeur</option>
              </select>
            </div>
          </div>
          <h4 className="font-medium text-gray-900 dark:text-white text-sm flex items-center gap-2"><Phone size={14} /> Contact d'urgence</h4>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Nom</label><input type="text" value={form.emergencyName || ''} onChange={(e) => update('emergencyName', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-900 dark:text-white outline-none" /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Téléphone</label><input type="text" value={form.emergencyPhone || ''} onChange={(e) => update('emergencyPhone', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-900 dark:text-white outline-none" /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Lien</label><input type="text" value={form.emergencyRelationship || ''} onChange={(e) => update('emergencyRelationship', e.target.value)} placeholder="Ex: Épouse" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-900 dark:text-white outline-none" /></div>
          </div>
          <h4 className="font-medium text-gray-900 dark:text-white text-sm flex items-center gap-2"><Heart size={14} /> Assurance</h4>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Assureur</label><input type="text" value={form.insuranceProvider || ''} onChange={(e) => update('insuranceProvider', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-900 dark:text-white outline-none" /></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">N° Assurance</label><input type="text" value={form.insuranceNumber || ''} onChange={(e) => update('insuranceNumber', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-900 dark:text-white outline-none" /></div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending} className="px-6 py-2.5 rounded-xl bg-medcare-purple text-white text-sm font-medium hover:bg-medcare-purple/90 disabled:opacity-50 transition-colors flex items-center gap-2">
          {updateMutation.isPending ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Enregistrement...</> : <><Save size={16} /> Enregistrer</>}
        </button>
      </div>
    </div>
  );
}
