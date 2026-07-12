import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('Les mots de passe ne correspondent pas.'); return; }
    if (password.length < 8) { toast.error('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      toast.success('Mot de passe réinitialisé avec succès !');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Token invalide ou expiré.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-medcare-purple/5 dark:from-dark-bg dark:via-dark-bg dark:to-medcare-purple/10 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-medcare-purple to-medcare-indigo flex items-center justify-center mb-4">
            <Stethoscope className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouveau mot de passe</h1>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-8">
          {success ? (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-medcare-green/10 flex items-center justify-center mb-4">
                <CheckCircle className="text-medcare-green" size={24} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Mot de passe modifié !</h2>
              <p className="text-sm text-gray-500 dark:text-dark-text mb-6">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
              <Link to="/login" className="inline-flex items-center gap-2 text-medcare-purple hover:underline text-sm font-medium"><ArrowLeft size={16} /> Se connecter</Link>
            </div>
          ) : !token ? (
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-dark-text mb-6">Lien de réinitialisation invalide ou manquant. Veuillez demander un nouveau lien.</p>
              <Link to="/forgot-password" className="inline-flex items-center gap-2 text-medcare-purple hover:underline text-sm font-medium"><ArrowLeft size={16} /> Demander un nouveau lien</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-dark-text">Entrez votre nouveau mot de passe.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none text-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={8} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none text-sm" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-medcare-purple to-medcare-indigo text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50">
                {loading ? 'Enregistrement...' : 'Réinitialiser le mot de passe'}
              </button>
              <Link to="/login" className="block text-center text-sm text-medcare-purple hover:underline"><ArrowLeft size={14} className="inline mr-1" /> Retour à la connexion</Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
