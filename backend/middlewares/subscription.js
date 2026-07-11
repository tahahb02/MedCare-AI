import Subscription from '../models/Subscription.js';

const EXEMPTED_ROUTES = [
  'GET /api/auth/me',
  'GET /api/patients/subscription',
  'POST /api/patients/change-password',
  'GET /api/notifications',
  'GET /api/patients/gamification',
  'GET /api/consent',
  'POST /api/data/export',
  'POST /api/data/delete'
];

export const checkSubscription = async (req, res, next) => {
  if (req.user.role !== 'patient') return next();

  const routeKey = `${req.method} ${req.path}`;
  if (EXEMPTED_ROUTES.some(r => req.path.startsWith(r.split(' ').slice(1).join(' ')))) return next();

  try {
    const subscription = await Subscription.findOne({ patientId: req.user._id });

    if (!subscription) return res.status(404).json({ message: 'Aucun abonnement trouvé. Contactez la clinique.' });

    const now = new Date();

    if (subscription.status === 'suspendu') {
      return res.status(403).json({ message: 'Votre abonnement est suspendu. Contactez la clinique.' });
    }

    if (subscription.status === 'expiré') {
      return res.status(403).json({ message: `Votre abonnement a expiré le ${subscription.endDate.toLocaleDateString('fr-FR')}. Contactez la clinique pour renouveler.` });
    }

    if (subscription.status === 'en_période_de_grâce') {
      req.subscriptionGrace = true;
      res.setHeader('X-Subscription-Grace', 'true');
    }

    if (subscription.status === 'actif' && subscription.endDate < now) {
      return res.status(403).json({ message: `Votre abonnement a expiré le ${subscription.endDate.toLocaleDateString('fr-FR')}.` });
    }

    next();
  } catch (error) {
    next(error);
  }
};
