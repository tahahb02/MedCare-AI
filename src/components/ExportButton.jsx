import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, File, Loader2 } from 'lucide-react';

const formatConfig = {
  pdf: { icon: FileText, label: 'PDF' },
  excel: { icon: FileSpreadsheet, label: 'Excel' },
  csv: { icon: File, label: 'CSV' },
};

export default function ExportButton({ onExport, format = 'pdf', label = 'Exporter' }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleExport = async (fmt) => {
    setLoading(true);
    setOpen(false);
    try {
      await onExport?.(fmt);
    } finally {
      setLoading(false);
    }
  };

  const fmt = formatConfig[format] || formatConfig.pdf;
  const Icon = fmt.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        {label}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              className="absolute right-0 mt-1 w-40 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border shadow-lg z-40 overflow-hidden"
            >
              {Object.entries(formatConfig).map(([key, cfg]) => {
                const FmtIcon = cfg.icon;
                return (
                  <button
                    key={key}
                    onClick={() => handleExport(key)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                  >
                    <FmtIcon size={14} />
                    {cfg.label}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
