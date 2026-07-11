import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, CheckCircle, Clock, AlertTriangle, Brain, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatDateTime } from '../../utils/helpers';

export default function DocumentsPatient() {
  const queryClient = useQueryClient();
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['patient-documents'], queryFn: async () => { const { data } = await api.get('/documents'); return data; } });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('type', 'autre');
      const { data } = await api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries('patient-documents'); toast.success('Document uploadé !'); setUploading(false); },
    onError: () => { toast.error("Erreur d'upload"); setUploading(false); }
  });

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    uploadMutation.mutate(file);
    e.target.value = '';
  };

  const statusBadge = (s) => {
    const map = { uploaded: { icon: Clock, color: 'text-gray-500 bg-gray-100', label: 'Uploadé' }, ai_reviewed: { icon: Brain, color: 'text-blue-600 bg-blue-50', label: 'Analysé par IA' }, doctor_reviewed: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Reviewé par médecin' } };
    const m = map[s] || map.uploaded;
    return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${m.color}`}><m.icon size={12} /> {m.label}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><FileText size={24} className="text-medcare-green" /> Mes Documents</h1>
        <input type="file" ref={fileRef} onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="px-4 py-2.5 rounded-xl bg-medcare-green text-white text-sm font-medium hover:bg-medcare-green/90 flex items-center gap-2 disabled:opacity-50">
          {uploading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Upload...</> : <><Upload size={16} /> Upload document</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data?.documents || []).map(d => (
          <div key={d._id} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-medcare-green/10 flex items-center justify-center"><FileText size={18} className="text-medcare-green" /></div>
              {statusBadge(d.status)}
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">{d.name}</h3>
            <p className="text-xs text-gray-500 mb-3">{formatDateTime(d.createdAt)}</p>
            {d.aiAnalysis?.summary && (
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1"><Brain size={12} /> Analyse IA</p>
                <p className="text-xs text-gray-700 dark:text-dark-text line-clamp-3">{d.aiAnalysis.summary}</p>
              </div>
            )}
            {d.doctorAnalysis?.summary && (
              <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-xl mt-2">
                <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1 flex items-center gap-1"><CheckCircle size={12} /> Avis médecin</p>
                <p className="text-xs text-gray-700 dark:text-dark-text line-clamp-3">{d.doctorAnalysis.summary}</p>
              </div>
            )}
          </div>
        ))}
        {(!data?.documents || data.documents.length === 0) && (
          <div className="col-span-full text-center py-12">
            <Upload size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">Aucun document. Uploadez votre premier document médical.</p>
          </div>
        )}
      </div>
    </div>
  );
}
