import { useQuery } from '@tanstack/react-query';
import { FileText, Eye, CheckCircle, Clock } from 'lucide-react';
import api from '../../api/axios';
import { formatDateTime } from '../../utils/helpers';

export default function DocumentsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['doctor-documents'], queryFn: async () => { const { data } = await api.get('/documents'); return data; } });

  const statusIcon = (s) => {
    if (s === 'doctor_reviewed') return <CheckCircle size={16} className="text-green-500" />;
    if (s === 'ai_reviewed') return <Clock size={16} className="text-blue-500" />;
    return <FileText size={16} className="text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><FileText size={24} className="text-medcare-blue" /> Documents</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data?.documents || []).map((d) => (
          <div key={d._id} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-medcare-blue/10 flex items-center justify-center"><FileText size={18} className="text-medcare-blue" /></div>
              {statusIcon(d.status)}
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">{d.name}</h3>
            <p className="text-xs text-gray-500 dark:text-dark-text mb-3">{d.patientId?.name || 'N/A'} • {formatDateTime(d.createdAt)}</p>
            {d.aiAnalysis?.summary && <p className="text-xs text-gray-600 dark:text-dark-text line-clamp-2 bg-gray-50 dark:bg-dark-bg p-2 rounded-lg">{d.aiAnalysis.summary}</p>}
          </div>
        ))}
        {(!data?.documents || data.documents.length === 0) && <p className="col-span-full text-center text-sm text-gray-400 py-12">Aucun document</p>}
      </div>
    </div>
  );
}
