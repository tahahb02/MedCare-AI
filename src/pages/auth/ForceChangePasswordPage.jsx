import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Check, X, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const criteria = [
  { label: '8 caractères minimum', test: (pw) => pw.length >= 8 },
  { label: 'Une majuscule', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Une minuscule', test: (pw) => /[a-z]/.test(pw) },
  { label: 'Un chiffre', test: (pw) => /[0-9]/.test(pw) },
  { label: 'Un caractère spécial (!@#$%^&*...)', test: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) },
];

export default function ForceChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/auth/force-change-password', { currentPassword, newPassword });
      return data;
    },
    onSuccess: (data) => {
      if (user) setUser({ ...user, mustChangePassword: false });
      toast.success(data.message);
      const redirectMap = { admin: '/admin', medecin: '/medecin', patient: '/patient' };
      navigate(redirectMap[user?.role] || '/login', { replace: true });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur lors du changement de mot de passe.')
  });

  const allValid = criteria.every((c) => c.test(newPassword)) && newPassword === confirmPassword && currentPassword.length > 0 && newPassword !== currentPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-medcare-purple/5 via-white to-medcare-green/5 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-medcare-purple/10 flex items-center justify-center mb-4">
              <Shield className="text-medcare-purple" size={32} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Changement de mot de passe</h1>
            <p className="text-sm text-gray-500 mt-2">
              Vous utilisez un mot de passe temporaire. Veuillez définir un nouveau mot de passe sécurisé pour accéder à votre espace.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe temporaire</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe temporaire"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none pr-10"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Entrez votre nouveau mot de passe"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none pr-10"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retapez le nouveau mot de passe"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:ring-2 focus:ring-medcare-purple focus:border-transparent outline-none"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
              )}
              {newPassword && newPassword === currentPassword && (
                <p className="text-xs text-red-500 mt-1">Le nouveau mot de passe doit être différent de l'actuel.</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase">Critères de sécurité</p>
              {criteria.map((c, i) => {
                const valid = c.test(newPassword);
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {valid ? <Check size={14} className="text-medcare-green" /> : <X size={14} className="text-gray-300" />}
                    <span className={valid ? 'text-medcare-green' : 'text-gray-400'}>{c.label}</span>
                  </div>
                );
              })}
              {newPassword && (
                <div className="flex items-center gap-2 text-sm">
                  {newPassword !== confirmPassword || !confirmPassword ? <X size={14} className="text-gray-300" /> : <Check size={14} className="text-medcare-green" />}
                  <span className={newPassword === confirmPassword && confirmPassword ? 'text-medcare-green' : 'text-gray-400'}>Les mots de passe correspondent</span>
                </div>
              )}
            </div>

            <button
              onClick={() => mutation.mutate()}
              disabled={!allValid || mutation.isPending}
              className="w-full py-3 rounded-xl bg-medcare-purple text-white font-medium hover:bg-medcare-purple/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {mutation.isPending ? 'Enregistrement...' : 'Enregistrer et accéder'}
              {!mutation.isPending && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
