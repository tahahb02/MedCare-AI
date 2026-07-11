import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Stethoscope, Shield, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import ThemeToggle from '../../components/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Bienvenue ${data.user.name} !`);
      const routeMap = { admin: '/admin', medecin: '/medecin', patient: '/patient' };
      navigate(routeMap[data.user.role] || '/login', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de connexion');
    } finally { setLoading(false); }
  };

  const quickLogin = async (accEmail, accPassword) => {
    setEmail(accEmail);
    setPassword(accPassword);
    setLoading(true);
    try {
      const data = await login(accEmail, accPassword);
      toast.success(`Bienvenue ${data.user.name} !`);
      const routeMap = { admin: '/admin', medecin: '/medecin', patient: '/patient' };
      navigate(routeMap[data.user.role] || '/login', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de connexion');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-medcare-purple/5 dark:from-dark-bg dark:via-dark-bg dark:to-medcare-purple/10 p-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-6 md:mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-medcare-purple to-medcare-indigo flex items-center justify-center mb-4 shadow-lg shadow-medcare-purple/25">
            <Stethoscope className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MedCare AI</h1>
          <p className="text-gray-500 dark:text-dark-text mt-1">Plateforme Médicale Intelligente</p>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-5 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Connexion</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none transition-all text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none transition-all text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-medcare-purple to-medcare-indigo text-white font-semibold hover:shadow-lg hover:shadow-medcare-purple/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Connexion...</span> : 'Se connecter'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <a href="/forgot-password" className="text-sm text-medcare-purple hover:underline">Mot de passe oublié ?</a>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-dark-border">
            <p className="text-xs text-center text-gray-400 dark:text-dark-text mb-3">Accès rapide — Cliquez pour explorer</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => quickLogin('admin@medcare.com', 'MedCare2024!')} disabled={loading} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-colors border border-violet-200 dark:border-violet-500/20 disabled:opacity-50">
                <Shield size={20} className="text-medcare-purple" />
                <span className="text-xs font-medium text-medcare-purple">Secrétaire</span>
              </button>
              <button onClick={() => quickLogin('dr.fassi@medcare.com', 'MedCare2024!')} disabled={loading} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors border border-blue-200 dark:border-blue-500/20 disabled:opacity-50">
                <Stethoscope size={20} className="text-medcare-blue" />
                <span className="text-xs font-medium text-medcare-blue">Médecin</span>
              </button>
              <button onClick={() => quickLogin('mohammed@medcare.com', 'MedCare2024!')} disabled={loading} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors border border-emerald-200 dark:border-emerald-500/20 disabled:opacity-50">
                <Heart size={20} className="text-medcare-green" />
                <span className="text-xs font-medium text-medcare-green">Patient</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-dark-text mt-6">
          © 2024 MedCare AI — Plateforme Médicale Intelligente
        </p>
      </motion.div>
    </div>
  );
}
