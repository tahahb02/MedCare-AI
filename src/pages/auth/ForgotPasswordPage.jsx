import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Email de réinitialisation envoyé !');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-medcare-purple/5 dark:from-dark-bg dark:via-dark-bg dark:to-medcare-purple/10 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-medcare-purple to-medcare-indigo flex items-center justify-center mb-4">
            <Stethoscope className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Réinitialisation</h1>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-medcare-green/10 flex items-center justify-center mb-4">
                <Mail className="text-medcare-green" size={24} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email envoyé !</h2>
              <p className="text-sm text-gray-500 dark:text-dark-text mb-6">Vérifiez votre boîte de réception pour réinitialiser votre mot de passe.</p>
              <Link to="/login" className="inline-flex items-center gap-2 text-medcare-purple hover:underline text-sm font-medium"><ArrowLeft size={16} /> Retour à la connexion</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-dark-text">Entrez votre email pour recevoir un lien de réinitialisation.</p>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none text-sm" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-medcare-purple to-medcare-indigo text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50">
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
              <Link to="/login" className="block text-center text-sm text-medcare-purple hover:underline"><ArrowLeft size={14} className="inline mr-1" /> Retour à la connexion</Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
