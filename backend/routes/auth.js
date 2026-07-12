import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import DoctorProfile from '../models/DoctorProfile.js';
import AdminProfile from '../models/AdminProfile.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateToken.js';
import { protect } from '../middlewares/auth.js';
import { sendWelcomeEmail } from '../utils/sendEmail.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'medcare_jwt_secret_dev';

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ message: 'Compte temporairement verrouillé. Réessayez plus tard.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);
    user.refreshToken = refreshToken;
    await user.save();

    let profile = null;
    if (user.role === 'patient') profile = await PatientProfile.findOne({ userId: user._id });
    else if (user.role === 'medecin') profile = await DoctorProfile.findOne({ userId: user._id });
    else if (user.role === 'admin') profile = await AdminProfile.findOne({ userId: user._id });

    res.json({
      accessToken, refreshToken,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isVerified: user.isVerified, preferences: user.preferences, twoFactorEnabled: user.twoFactorEnabled, mustChangePassword: user.mustChangePassword },
      profile
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Register (doctors only)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const userRole = role === 'medecin' ? 'medecin' : 'patient';
    
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Cet email est déjà utilisé.' });

    const user = await User.create({ name, email, password, phone, role: userRole });
    
    if (userRole === 'medecin') {
      await DoctorProfile.create({ userId: user._id });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      accessToken, refreshToken,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Refresh token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token requis.' });

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Token invalide.' });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id, user.role);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    let profile = null;
    if (req.user.role === 'patient') profile = await PatientProfile.findOne({ userId: req.user._id }).populate('primaryDoctorId', 'name email');
    else if (req.user.role === 'medecin') profile = await DoctorProfile.findOne({ userId: req.user._id });
    else if (req.user.role === 'admin') profile = await AdminProfile.findOne({ userId: req.user._id });

    res.json({ user: req.user, profile });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Logout
router.post('/logout', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ message: 'Déconnexion réussie.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Change password (normal)
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: 'Mot de passe actuel incorrect.' });

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    user.mustChangePassword = false;
    await user.save();

    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Force change password (first login with temporary password)
router.post('/force-change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ message: 'Nouveau mot de passe requis.' });

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: 'Mot de passe temporaire incorrect.' });

    if (newPassword.length < 8) return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
    if (!/[A-Z]/.test(newPassword)) return res.status(400).json({ message: 'Le mot de passe doit contenir au moins une majuscule.' });
    if (!/[a-z]/.test(newPassword)) return res.status(400).json({ message: 'Le mot de passe doit contenir au moins une minuscule.' });
    if (!/[0-9]/.test(newPassword)) return res.status(400).json({ message: 'Le mot de passe doit contenir au moins un chiffre.' });
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) return res.status(400).json({ message: 'Le mot de passe doit contenir au moins un caractère spécial.' });

    user.password = newPassword;
    user.mustChangePassword = false;
    user.passwordChangedAt = new Date();
    await user.save();

    res.json({ message: 'Mot de passe modifié avec succès. Vous pouvez maintenant accéder à votre espace.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Aucun compte trouvé avec cet email.' });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'medcare_jwt_secret_dev', { expiresIn: '1h' });
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000);
    await user.save();

    res.json({ message: 'Email de réinitialisation envoyé.', resetToken });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medcare_jwt_secret_dev');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error) {
    res.status(400).json({ message: 'Token invalide ou expiré.' });
  }
});

export default router;
