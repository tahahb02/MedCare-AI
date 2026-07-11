import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, ExternalLink } from 'lucide-react';

export default function ConsentModal({ isOpen, onClose, onAccept }) {
  const [consents, setConsents] = useState({
    processing: false,
    marketing: false,
    thirdParty: false,
  });

  const toggle = (key) => setConsents((prev) => ({ ...prev, [key]: !prev[key] }));

  const acceptAll = () => {
    setConsents({ processing: true, marketing: true, thirdParty: true });
    onAccept?.({ processing: true, marketing: true, thirdParty: true });
  };

  const acceptSelected = () => {
    onAccept?.(consents);
  };

  const rejectAll = () => {
    setConsents({ processing: false, marketing: false, thirdParty: false });
    onAccept?.({ processing: false, marketing: false, thirdParty: false });
  };

  const checkboxes = [
    { key: 'processing', label: 'Traitement des données médicales', required: true, desc: 'Nécessaire pour fournir nos services de santé.' },
    { key: 'marketing', label: 'Communications marketing', required: false, desc: 'Recevoir des informations sur nos services.' },
    { key: 'thirdParty', label: 'Partage avec des tiers', required: false, desc: 'Partager vos données avec des partenaires de soins.' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Consentement RGPD</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nous respectons votre vie privée. Veuillez configurer vos préférences de consentement.
            </p>

            <div className="space-y-3">
              {checkboxes.map((item) => (
                <label key={item.key} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-border/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
                  <input
                    type="checkbox"
                    checked={consents[item.key]}
                    onChange={() => !item.required && toggle(item.key)}
                    disabled={item.required}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 disabled:opacity-50"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</span>
                      {item.required && <span className="text-[10px] text-gray-400">(Requis)</span>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <a href="/politique-confidentialite" className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 transition-colors">
              <ExternalLink size={12} /> Politique de confidentialité
            </a>

            <div className="flex gap-2 pt-1">
              <button onClick={rejectAll} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
                Tout refuser
              </button>
              <button onClick={acceptSelected} className="flex-1 py-2.5 rounded-xl border border-primary-300 dark:border-primary-700 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                Accepter la sélection
              </button>
              <button onClick={acceptAll} className="flex-1 py-2.5 rounded-xl bg-primary-500 text-sm font-medium text-white hover:bg-primary-600 transition-colors">
                Tout accepter
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
