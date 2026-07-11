import express from 'express';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import Notification from '../models/Notification.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect);

function generateReferralCode(name) {
  const base = name.replace(/\s+/g, '').substring(0, 6).toUpperCase();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${suffix}`;
}

// Get referral code
router.get('/code', async (req, res) => {
  try {
    let profile = await PatientProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await PatientProfile.create({ userId: req.user._id });
    }

    if (!profile.referralCode) {
      profile.referralCode = generateReferralCode(req.user.name);
      await profile.save();
    }

    res.json({ success: true, data: { code: profile.referralCode, shareUrl: `/register?ref=${profile.referralCode}` } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Referral stats
router.get('/stats', async (req, res) => {
  try {
    let profile = await PatientProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await PatientProfile.create({ userId: req.user._id });
    }

    const referredUsers = await User.find({ referredBy: req.user._id }).select('name email createdAt');
    const totalReferrals = referredUsers.length;
    const activeReferrals = await User.countDocuments({ referredBy: req.user._id, isActive: true });

    res.json({
      success: true,
      data: {
        referralCode: profile.referralCode,
        totalReferrals,
        activeReferrals,
        pendingReferrals: totalReferrals - activeReferrals,
        referredUsers,
        rewardPointsEarned: totalReferrals * 50
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Apply referral code
router.post('/apply', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Code de parrainage requis.' });

    const referrerProfile = await PatientProfile.findOne({ referralCode: code });
    if (!referrerProfile) return res.status(404).json({ message: 'Code de parrainage invalide.' });
    if (referrerProfile.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Vous ne pouvez pas utiliser votre propre code.' });
    }

    const patientProfile = await PatientProfile.findOne({ userId: req.user._id });
    if (patientProfile && patientProfile.referredBy) {
      return res.status(400).json({ message: 'Un code de parrainage a déjà été appliqué.' });
    }

    if (!patientProfile) {
      await PatientProfile.create({ userId: req.user._id, referredBy: referrerProfile.userId });
    } else {
      patientProfile.referredBy = referrerProfile.userId;
      await patientProfile.save();
    }

    await Notification.create({
      userId: referrerProfile.userId,
      senderId: req.user._id,
      senderRole: 'patient',
      category: 'système',
      type: 'système',
      title: 'Nouveau parrainage',
      message: `${req.user.name} a utilisé votre code de parrainage !`,
      priority: 'medium'
    });

    res.json({ success: true, data: { message: 'Code appliqué avec succès.' } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

export default router;
