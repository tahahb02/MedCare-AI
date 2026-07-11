import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, Droplets, Activity, Thermometer, TrendingUp, FileText, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import api from '../../api/axios';
import { formatDate, healthScoreColor } from '../../utils/helpers';

export default function DossierMedical() {
  const { data: profile } = useQuery({ queryKey: ['patient-profile'], queryFn: async () => { const { data } = await api.get('/patients/profile'); return data; } });
  const { data: metrics } = useQuery({ queryKey: ['patient-metrics'], queryFn: async () => { const { data } = await api.get('/patients/metrics'); return data; } });

  const p = profile?.profile;
  const m = metrics;

  const bpData = (m?.vitalSigns?.bloodPressure || []).map(d => ({ date: formatDate(d.date), systolic: d.systolic, diastolic: d.diastolic }));
  const weightData = (m?.vitalSigns?.weight || []).map(d => ({ date: formatDate(d.date), weight: d.weight }));
  const sugarData = (m?.vitalSigns?.bloodSugar || []).map(d => ({ date: formatDate(d.date), value: d.value }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Heart size={24} className="text-medcare-green" /> Mon Dossier Médical</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4">
          <p className="text-xs text-gray-500 mb-1">Groupe sanguin</p>
          <p className="text-xl font-bold text-medcare-green">{p?.bloodType || 'N/A'}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4">
          <p className="text-xs text-gray-500 mb-1">Taille</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{p?.height || 'N/A'} cm</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4">
          <p className="text-xs text-gray-500 mb-1">Poids</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{p?.weight || 'N/A'} kg</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4">
          <p className="text-xs text-gray-500 mb-1">IMC</p>
          <p className={`text-xl font-bold ${healthScoreColor(p?.BMI > 30 ? 30 : p?.BMI > 25 ? 60 : 85)}`}>{p?.BMI || 'N/A'}</p>
        </motion.div>
      </div>

      {(p?.allergies || []).length > 0 && (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><AlertCircle size={18} className="text-red-500" /> Allergies</h3>
          <div className="flex flex-wrap gap-2">{p.allergies.map((a, i) => <span key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium ${a.severity === 'grave' ? 'bg-red-100 text-red-700' : a.severity === 'modérée' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>{a.name} ({a.severity})</span>)}</div>
        </div>
      )}

      {(p?.chronicConditions || []).length > 0 && (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Activity size={18} className="text-medcare-blue" /> Conditions chroniques</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{p.chronicConditions.map((c, i) => <div key={i} className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl flex items-center justify-between"><span className="text-sm text-gray-900 dark:text-white">{c.name}</span><span className={`px-2 py-1 rounded-full text-xs ${c.status === 'contrôlé' || c.status === 'en_rémission' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{c.status}</span></div>)}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bpData.length > 0 && <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6"><h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Heart size={18} className="text-red-500" /> Tension Artérielle</h3><ResponsiveContainer width="100%" height={200}><LineChart data={bpData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} name="Systolique" /><Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} name="Diastolique" /></LineChart></ResponsiveContainer></div>}
        {weightData.length > 0 && <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6"><h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-medcare-purple" /> Évolution Poids</h3><ResponsiveContainer width="100%" height={200}><AreaChart data={weightData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Area type="monotone" dataKey="weight" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.1} /></AreaChart></ResponsiveContainer></div>}
        {sugarData.length > 0 && <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6"><h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Droplets size={18} className="text-medcare-green" /> Glycémie</h3><ResponsiveContainer width="100%" height={200}><BarChart data={sugarData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>}
      </div>
    </div>
  );
}
