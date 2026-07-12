import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MessageSquare, ClipboardList, XCircle, User, Wifi, WifiOff, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';

const doctorStatusConfig = {
  available: { label: 'Disponible', color: 'text-green-600 dark:text-green-400', dot: 'bg-green-500', pulse: true },
  busy: { label: 'Occupé', color: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500', pulse: false },
  break: { label: 'Pause', color: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-500', pulse: false },
};

export default function WaitingRoomView() {
  const queryClient = useQueryClient();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [questionnaire, setQuestionnaire] = useState({ reason: '', symptoms: '', duration: '', medications: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['patient-waiting-room'],
    queryFn: async () => { const { data } = await api.get('/waiting-room/position'); return data; },
    refetchInterval: 30000,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => { await api.post('/waiting-room/cancel'); },
    onSuccess: () => { queryClient.invalidateQueries('patient-waiting-room'); toast.success('Rendez-vous annulé'); },
    onError: () => toast.error("Erreur lors de l'annulation"),
  });

  const sendChatMutation = useMutation({
    mutationFn: async (msg) => { const { data } = await api.post('/conversations', { content: msg }); return data; },
    onSuccess: (data) => {
      setChatMessages(prev => [...prev, { text: chatMessage, from: 'patient' }, ...(data?.reply ? [{ text: data.reply, from: 'secretary' }] : [])]);
      setChatMessage('');
    },
    onError: () => toast.error('Erreur'),
  });

  const submitQuestionnaire = useMutation({
    mutationFn: async () => { await api.post('/waiting-room/questionnaire', questionnaire); },
    onSuccess: () => { queryClient.invalidateQueries('patient-waiting-room'); toast.success('Questionnaire envoyé'); setShowQuestionnaire(false); },
    onError: () => toast.error('Erreur'),
  });

  const status = data?.status || 'waiting';
  const position = data?.position || 0;
  const estimatedWait = data?.estimatedWait || 0;
  const doctorStatus = data?.doctorStatus || 'available';
  const appointment = data?.appointment;

  const [waitTime, setWaitTime] = useState(0);
  useEffect(() => {
    if (!appointment?.waitStartTime) return;
    const update = () => setWaitTime(Math.floor((Date.now() - new Date(appointment.waitStartTime).getTime()) / 1000));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [appointment?.waitStartTime]);

  const waitMin = Math.floor(waitTime / 60);
  const waitSec = waitTime % 60;

  if (status === 'in_consultation') {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <User size={36} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Consultation en cours</h2>
          <p className="text-gray-500 dark:text-dark-text">Vous êtes en train d'être consulté. Bonne visite !</p>
        </motion.div>
      </div>
    );
  }

  if (status === 'cancelled' || status === 'completed') {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-12 text-center">
          <XCircle size={48} className="mx-auto text-gray-300 mb-3" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{status === 'cancelled' ? 'Rendez-vous annulé' : 'Consultation terminée'}</h2>
          <p className="text-gray-500 dark:text-dark-text">{status === 'cancelled' ? 'Votre rendez-vous a été annulé.' : 'Merci pour votre visite. À bientôt !'}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Clock size={24} className="text-medcare-purple" /> Salle d'attente</h1>
        <p className="text-gray-500 dark:text-dark-text text-sm">En attente de votre consultation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-100 dark:text-dark-border" />
                <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="6" className="text-medcare-purple" strokeDasharray={`${2 * Math.PI * 54}`} strokeDashoffset={`${2 * Math.PI * 54 * (1 - Math.min(position / 10, 1))}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">#{position}</span>
                <span className="text-xs text-gray-400">position</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Votre position</h3>
            <p className="text-sm text-gray-500 dark:text-dark-text mb-4">Temps estimé : <span className="font-medium text-gray-900 dark:text-white">{estimatedWait} min</span></p>

            <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
              <span className={`w-2 h-2 rounded-full ${doctorStatusConfig[doctorStatus]?.dot || 'bg-gray-500'} ${doctorStatusConfig[doctorStatus]?.pulse ? 'animate-pulse' : ''}`}></span>
              <span className={`text-sm font-medium ${doctorStatusConfig[doctorStatus]?.color || 'text-gray-500'}`}>
                Médecin : {doctorStatusConfig[doctorStatus]?.label || doctorStatus}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Détails</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
              <span className="text-sm text-gray-500 dark:text-dark-text">Temps d'attente</span>
              <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">{waitMin}m {waitSec.toString().padStart(2, '0')}s</span>
            </div>
            {appointment && (
              <>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                  <span className="text-sm text-gray-500 dark:text-dark-text">Date du RDV</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(appointment.date)} {appointment.time}</span>
                </div>
                {appointment.motif && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                    <span className="text-sm text-gray-500 dark:text-dark-text">Motif</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{appointment.motif}</span>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setShowChat(!showChat)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg flex items-center justify-center gap-2 transition-colors">
              <MessageSquare size={16} /> Messagerie
            </button>
            <button onClick={() => setShowQuestionnaire(!showQuestionnaire)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg flex items-center justify-center gap-2 transition-colors">
              <ClipboardList size={16} /> Questionnaire
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showChat && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Chat avec la secrétaire</h3>
              <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={18} /></button>
            </div>
            <div className="h-48 overflow-y-auto mb-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl space-y-2">
              {chatMessages.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">Envoyez un message à la secrétaire</p> : chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'patient' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${m.from === 'patient' ? 'bg-medcare-purple text-white rounded-br-none' : 'bg-gray-200 dark:bg-dark-border text-gray-900 dark:text-white rounded-bl-none'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (chatMessage.trim()) sendChatMutation.mutate(chatMessage); } }} placeholder="Votre message..." className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm" />
              <button onClick={() => { if (chatMessage.trim()) sendChatMutation.mutate(chatMessage); }} disabled={!chatMessage.trim()} className="px-4 py-2.5 rounded-xl bg-medcare-purple text-white text-sm font-medium hover:bg-medcare-purple/90 disabled:opacity-50 transition-colors">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQuestionnaire && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Questionnaire pré-consultation</h3>
              <button onClick={() => setShowQuestionnaire(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Motif de la visite</label>
                <input type="text" value={questionnaire.reason} onChange={e => setQuestionnaire({ ...questionnaire, reason: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm" placeholder="Ex: Consultation générale, douleur..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Symptômes</label>
                <textarea value={questionnaire.symptoms} onChange={e => setQuestionnaire({ ...questionnaire, symptoms: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm" placeholder="Décrivez vos symptômes..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Depuis quand ?</label>
                  <input type="text" value={questionnaire.duration} onChange={e => setQuestionnaire({ ...questionnaire, duration: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm" placeholder="Ex: 3 jours" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Médicaments</label>
                  <input type="text" value={questionnaire.medications} onChange={e => setQuestionnaire({ ...questionnaire, medications: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm" placeholder="Médicaments actuels" />
                </div>
              </div>
              <button onClick={() => submitQuestionnaire.mutate()} disabled={submitQuestionnaire.isPending} className="px-5 py-2.5 rounded-xl bg-medcare-purple text-white text-sm font-medium hover:bg-medcare-purple/90 disabled:opacity-50 transition-colors">
                {submitQuestionnaire.isPending ? 'Envoi...' : 'Envoyer le questionnaire'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center">
        <button onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending} className="px-6 py-2.5 rounded-xl border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition-colors flex items-center gap-2">
          <XCircle size={16} /> {cancelMutation.isPending ? 'Annulation...' : 'Annuler le rendez-vous'}
        </button>
      </div>
    </div>
  );
}
