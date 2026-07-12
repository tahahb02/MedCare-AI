import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Building2, Clock, Globe, Mail, Upload, Save, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const tabs = [
  { id: 'info', label: 'Informations', icon: Building2 },
  { id: 'hours', label: 'Horaires', icon: Clock },
  { id: 'defaults', label: 'Paramètres', icon: Settings },
  { id: 'email', label: 'Emails', icon: Mail },
  { id: 'import', label: 'Import CSV', icon: Upload },
];

const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const defaultHours = daysOfWeek.map(day => ({
  day,
  open: day === 'Samedi' ? '09:00' : day === 'Dimanche' ? '' : '08:00',
  close: day === 'Samedi' ? '13:00' : day === 'Dimanche' ? '' : '18:00',
  closed: day === 'Dimanche',
}));

export default function SettingsClinic() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('info');
  const [clinicName, setClinicName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState('XOF');
  const [language, setLanguage] = useState('fr');
  const [timezone, setTimezone] = useState('Africa/Abidjan');
  const [hours, setHours] = useState(defaultHours);
  const [emailTemplate, setEmailTemplate] = useState('Bonjour,\n\nVotre rendez-vous est confirmé.\n\nCordialement,\nMedCare AI');
  const [csvFile, setCsvFile] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-clinic-settings'],
    queryFn: async () => { const { data } = await api.get('/admin/clinic'); return data; },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { clinicName, address, phone, email, hours, currency, language, timezone, emailTemplate };
      const { data } = await api.put('/admin/clinic', payload);
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries('admin-clinic-settings'); toast.success('Paramètres sauvegardés'); },
    onError: () => toast.error('Erreur de sauvegarde'),
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!csvFile) return;
      const formData = new FormData();
      formData.append('file', csvFile);
      const { data } = await api.post('/admin/patients/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return data;
    },
    onSuccess: (data) => { toast.success(`${data?.imported || 0} lignes importées`); setCsvFile(null); },
    onError: () => toast.error("Erreur lors de l'import"),
  });

  const initFromData = () => {
    if (data?.settings) {
      const s = data.settings;
      setClinicName(s.clinicName || '');
      setAddress(s.address || '');
      setPhone(s.phone || '');
      setEmail(s.email || '');
      setCurrency(s.currency || 'XOF');
      setLanguage(s.language || 'fr');
      setTimezone(s.timezone || 'Africa/Abidjan');
      if (s.hours) setHours(s.hours);
      if (s.emailTemplate) setEmailTemplate(s.emailTemplate);
    }
  };

  useState(() => { if (data) initFromData(); }, [data]);

  const updateHour = (index, field, value) => {
    const updated = [...hours];
    updated[index] = { ...updated[index], [field]: value };
    setHours(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Settings size={24} className="text-medcare-purple" /> Paramètres Clinique</h1>
        <p className="text-gray-500 dark:text-dark-text text-sm">Configurez votre établissement</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-medcare-purple text-white' : 'bg-white dark:bg-dark-card text-gray-600 dark:text-dark-text border border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg'}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-medcare-purple border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Informations de la clinique</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Nom</label>
                <input type="text" value={clinicName} onChange={e => setClinicName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Adresse</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Téléphone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Logo</label>
                <input type="file" accept="image/*" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-medcare-purple/10 file:text-medcare-purple file:text-sm file:font-medium" />
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Horaires d'ouverture</h3>
              {hours.map((h, i) => (
                <div key={h.day} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                  <span className="text-sm font-medium text-gray-900 dark:text-white sm:w-24">{h.day}</span>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={!h.closed} onChange={e => updateHour(i, 'closed', !e.target.checked)} className="rounded border-gray-300 text-medcare-purple" />
                    {!h.closed ? (
                      <div className="flex items-center gap-2">
                        <input type="time" value={h.open} onChange={e => updateHour(i, 'open', e.target.value)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm" />
                        <span className="text-gray-400">-</span>
                        <input type="time" value={h.close} onChange={e => updateHour(i, 'close', e.target.value)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm" />
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Fermé</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'defaults' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Paramètres par défaut</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Devise</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm">
                    <option value="XOF">XOF (FCFA)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (Dollar)</option>
                    <option value="XAF">XAF (FCFA CEMAC)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Langue</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Fuseau horaire</label>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm">
                    <option value="Africa/Abidjan">Abidjan (GMT+0)</option>
                    <option value="Africa/Dakar">Dakar (GMT+0)</option>
                    <option value="Africa/Lagos">Lagos (GMT+1)</option>
                    <option value="Africa/Douala">Douala (GMT+1)</option>
                    <option value="Europe/Paris">Paris (GMT+1/+2)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Modèle d'email par défaut</h3>
              <textarea value={emailTemplate} onChange={e => setEmailTemplate(e.target.value)} rows={8} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm font-mono" placeholder="Modèle d'email" />
              <p className="text-xs text-gray-400">Variables disponibles: {'{{patient_name}}'}, {'{{doctor_name}}'}, {'{{date}}'}, {'{{time}}'}, {'{{clinic_name}}'}</p>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Importer des données CSV</h3>
              <p className="text-sm text-gray-500 dark:text-dark-text">Importez des patients, médecins ou autres données depuis un fichier CSV.</p>
              <div className="border-2 border-dashed border-gray-200 dark:border-dark-border rounded-2xl p-8 text-center">
                <Upload size={40} className="mx-auto text-gray-300 mb-3" />
                <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-medcare-purple/10 file:text-medcare-purple file:font-medium" />
                {csvFile && <p className="text-sm text-gray-700 dark:text-dark-text mt-2">{csvFile.name}</p>}
              </div>
              <button onClick={() => importMutation.mutate()} disabled={!csvFile || importMutation.isPending} className="px-5 py-2.5 rounded-xl bg-medcare-purple text-white text-sm font-medium hover:bg-medcare-purple/90 disabled:opacity-50 transition-colors flex items-center gap-2">
                <Upload size={16} /> {importMutation.isPending ? 'Import...' : 'Importer'}
              </button>
            </div>
          )}

          {activeTab !== 'import' && (
            <div className="mt-6 flex justify-end">
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="px-5 py-2.5 rounded-xl bg-medcare-purple text-white text-sm font-medium hover:bg-medcare-purple/90 disabled:opacity-50 transition-colors flex items-center gap-2">
                <Save size={16} /> {saveMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
