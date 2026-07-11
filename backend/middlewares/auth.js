import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'medcare_jwt_secret_dev';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: 'Non autorisé. Veuillez vous connecter.' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Utilisateur non trouvé.' });
    if (user.changedPasswordAfter(decoded.iat)) return res.status(401).json({ message: 'Mot de passe récemment modifié. Reconnectez-vous.' });
    if (!user.isActive) return res.status(403).json({ message: 'Compte désactivé.' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Vous n\'avez pas les droits nécessaires pour cette action.' });
  }
  next();
};

export const verifiedOnly = (req, res, next) => {
  if (!req.user.isVerified) return res.status(403).json({ message: 'Compte non vérifié.' });
  next();
};
