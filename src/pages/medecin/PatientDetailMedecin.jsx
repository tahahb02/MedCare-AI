import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, Droplets, Activity, FileText, Calendar, Pill } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';

export default function PatientDetailMedecin() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ['doctor-patient-detail', id], queryFn: async () => { const { data } = await api.get(`/docteurs/patients/${id}`); return data; } });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-medcare-blue border-t-transparent rounded-full animate-spin"></div></div>;

  const { patient, appointments, documents } = data || {};
  const bpData = (patient?.bloodPressureHistory || []).map(d => ({ date: formatDate(d.date), systolic: d.systolic, diastolic: d.diastolic }));
  const weightData = (patient?.weightHistory || []).map(d => ({ date: formatDate(d.date), weight: d.weight }));

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-medcare-blue/10 flex items-center justify-center text-medcare-blue text-2xl font-bold">{patient?.userId?.name?.[0] || 'P'}</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{patient?.userId?.name || 'Patient'}</h1>
            <p className="text-sm text-gray-500 dark:text-dark-text">{patient?.medicalRecordNumber} • {patient?.gender} • {patient?.bloodType || 'N/A'}</p>
            <p className="text-sm text-gray-500 dark:text-dark-text">{patient?.userId?.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4"><p className="text-xs text-gray-500 mb-1">Taille</p><p className="text-lg font-bold text-gray-900 dark:text-white">{patient?.height || 'N/A'} cm</p></div>
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4"><p className="text-xs text-gray-500 mb-1">Poids</p><p className="text-lg font-bold text-gray-900 dark:text-white">{patient?.weight || 'N/A'} kg</p></div>
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4"><p className="text-xs text-gray-500 mb-1">IMC</p><p className="text-lg font-bold text-gray-900 dark:text-white">{patient?.BMI || 'N/A'}</p></div>
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4"><p className="text-xs text-gray-500 mb-1">Activité</p><p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{patient?.physicalActivityLevel || 'N/A'}</p></div>
      </div>

      {(patient?.allergies || []).length > 0 && (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Heart size={18} className="text-red-500" /> Allergies</h3>
          <div className="flex flex-wrap gap-2">{patient.allergies.map((a, i) => <span key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium ${a.severity === 'grave' ? 'bg-red-100 text-red-700' : a.severity === 'modérée' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>{a.name}</span>)}</div>
        </div>
      )}

      {(patient?.chronicConditions || []).length > 0 && (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Activity size={18} className="text-medcare-blue" /> Conditions chroniques</h3>
          <div className="space-y-2">{patient.chronicConditions.map((c, i) => <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-xl"><span className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</span><span className={`px-2 py-1 rounded-full text-xs ${c.status === 'actif' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{c.status}</span></div>)}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bpData.length > 0 && <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6"><h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tension Artérielle</h3><ResponsiveContainer width="100%" height={200}><LineChart data={bpData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} /><Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} /></LineChart></ResponsiveContainer></div>}
        {weightData.length > 0 && <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6"><h3 className="font-semibold text-gray-900 dark:text-white mb-4">Évolution Poids</h3><ResponsiveContainer width="100%" height={200}><AreaChart data={weightData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Area type="monotone" dataKey="weight" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.1} /></AreaChart></ResponsiveContainer></div>}
      </div>
    </div>
  );
}
