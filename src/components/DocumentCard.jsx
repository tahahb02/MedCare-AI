import { motion } from 'framer-motion';
import { FileText, Download, Trash2, Eye, Bot, CheckCircle2, Clock } from 'lucide-react';

const statusConfig = {
  uploaded: { color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: Clock, label: 'Téléversé' },
  ai_reviewed: { color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', icon: Bot, label: 'Analysé par IA' },
  doctor_reviewed: { color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2, label: 'Validé' },
};

const typeBadge = {
  pdf: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  image: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  lab: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export default function DocumentCard({ document, onView, onDownload, onDelete }) {
  const status = statusConfig[document.status] || statusConfig.uploaded;
  const StatusIcon = status.icon;
  const badgeStyle = typeBadge[document.type?.toLowerCase()] || typeBadge.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 space-y-3"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-gray-100 dark:bg-dark-border">
          <FileText size={20} className="text-gray-500 dark:text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">{document.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${badgeStyle}`}>
              {document.type || 'DOC'}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{document.uploadDate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <StatusIcon size={14} />
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
      </div>

      {document.aiAnalysis && (
        <p className="text-xs text-gray-500 dark:text-dark-text line-clamp-2 bg-gray-50 dark:bg-dark-border/50 rounded-lg p-2">
          {document.aiAnalysis}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        {onView && (
          <button onClick={() => onView(document)} className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors">
            <Eye size={14} /> Voir
          </button>
        )}
        {onDownload && (
          <button onClick={() => onDownload(document)} className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <Download size={14} /> Télécharger
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(document)} className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 ml-auto transition-colors">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
