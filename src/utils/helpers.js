import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (date) => {
  if (!date) return 'N/A';
  try { return format(new Date(date), 'dd MMM yyyy', { locale: fr }); } catch { return 'Date invalide'; }
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  try { return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: fr }); } catch { return 'Date invalide'; }
};

export const formatRelative = (date) => {
  if (!date) return '';
  try { return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr }); } catch { return ''; }
};

export const formatCurrency = (amount, currency = 'MAD') => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency }).format(amount || 0);
};

export const urgencyColor = (degree) => {
  const colors = { routine: 'bg-green-100 text-green-700', normal: 'bg-blue-100 text-blue-700', urgent: 'bg-orange-100 text-orange-700', 'très_urgent': 'bg-red-100 text-red-700', critique: 'bg-red-600 text-white' };
  return colors[degree] || colors.normal;
};

export const subscriptionStatusColor = (status) => {
  const colors = { actif: 'bg-green-100 text-green-700 border-green-200', expiré: 'bg-red-100 text-red-700 border-red-200', suspendu: 'bg-gray-100 text-gray-700 border-gray-200', 'en_période_de_grâce': 'bg-blue-100 text-blue-700 border-blue-200', 'en_attente': 'bg-yellow-100 text-yellow-700 border-yellow-200', annulé: 'bg-gray-100 text-gray-500 border-gray-200' };
  return colors[status] || colors['en_attente'];
};

export const trajectoryColor = (t) => {
  const c = { 'amélioration': 'text-green-600', stable: 'text-yellow-600', 'dégradation': 'text-red-600' };
  return c[t] || 'text-gray-600';
};

export const healthScoreColor = (score) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

export const healthScoreBg = (score) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

export const daysUntil = (date) => {
  if (!date) return 0;
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const truncate = (str, len = 100) => str?.length > len ? str.slice(0, len) + '...' : str || '';
