import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Mail, Send, Eye, MousePointerClick, Clock, Plus, FileText, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';

const statusConfig = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300' },
  sent: { label: 'Envoyé', color: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' },
  scheduled: { label: 'Programmé', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' },
};

const segments = [
  { value: 'all', label: 'Tous' },
  { value: 'medecin', label: 'Médecins' },
  { value: 'patient', label: 'Patients' },
  { value: 'pathology', label: 'Par pathologie' },
  { value: 'subscription', label: "Par type d'abonnement" },
];

export default function NewsletterManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [segment, setSegment] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-newsletters'],
    queryFn: async () => { const { data } = await api.get('/admin/newsletters'); return data; },
  });

  const createMutation = useMutation({
    mutationFn: async () => { const { data } = await api.post('/admin/newsletters', { title, content, segment }); return data; },
    onSuccess: () => {
      queryClient.invalidateQueries('admin-newsletters');
      toast.success('Newsletter créée');
      setTitle(''); setContent(''); setSegment('all'); setShowForm(false);
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const sendMutation = useMutation({
    mutationFn: async (id) => { await api.post(`/admin/newsletters/${id}/send`); },
    onSuccess: () => { queryClient.invalidateQueries('admin-newsletters'); toast.success('Newsletter envoyée !'); },
    onError: () => toast.error("Erreur lors de l'envoi"),
  });

  const newsletters = data?.newsletters || [];
  const stats = data?.stats || { sent: 0, opened: 0, clicked: 0 };

  const statCards = [
    { label: 'Envoyées', value: stats.sent, icon: Send, color: 'from-medcare-purple to-medcare-indigo' },
    { label: 'Ouvertes', value: stats.opened, icon: Eye, color: 'from-medcare-blue to-blue-600' },
    { label: 'Cliquées', value: stats.clicked, icon: MousePointerClick, color: 'from-medcare-green to-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Mail size={24} className="text-medcare-purple" /> Newsletters</h1>
          <p className="text-gray-500 dark:text-dark-text text-sm">Gérez vos campagnes par email</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2.5 rounded-xl bg-medcare-purple text-white text-sm font-medium flex items-center gap-2 hover:bg-medcare-purple/90 transition-colors">
          <Plus size={16} /> Nouvelle newsletter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon size={20} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-dark-text mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Nouvelle newsletter</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Titre</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm" placeholder="Titre de la newsletter" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Contenu</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm" placeholder="Contenu HTML ou texte" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Segment</label>
              <select value={segment} onChange={e => setSegment(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm">
                {segments.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !title || !content} className="px-5 py-2.5 rounded-xl bg-medcare-purple text-white text-sm font-medium hover:bg-medcare-purple/90 disabled:opacity-50 transition-colors">
                {createMutation.isPending ? 'Création...' : 'Créer (Brouillon)'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">Annuler</button>
            </div>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-medcare-purple border-t-transparent rounded-full animate-spin"></div></div>
      ) : newsletters.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border">
          <FileText size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">Aucune newsletter. Créez-en une !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {newsletters.map((nl, i) => (
            <motion.div key={nl._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{nl.title}</h4>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusConfig[nl.status]?.color || statusConfig.draft.color}`}>
                      {statusConfig[nl.status]?.label || nl.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-dark-text line-clamp-2 mb-2">{nl.content}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Mail size={12} /> {nl.segment || 'Tous'}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(nl.createdAt)}</span>
                    {nl.sentAt && <span className="flex items-center gap-1"><Send size={12} /> Envoyé {formatDate(nl.sentAt)}</span>}
                  </div>
                </div>
                {nl.status === 'draft' && (
                  <button onClick={() => sendMutation.mutate(nl._id)} disabled={sendMutation.isPending} className="px-4 py-2 rounded-xl bg-medcare-purple text-white text-sm font-medium flex items-center gap-2 hover:bg-medcare-purple/90 disabled:opacity-50 transition-colors whitespace-nowrap">
                    <Send size={14} /> Envoyer
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
