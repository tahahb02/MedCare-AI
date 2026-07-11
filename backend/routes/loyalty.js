import express from 'express';
import GamificationProfile from '../models/GamificationProfile.js';
import Notification from '../models/Notification.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect);

// Get loyalty profile
router.get('/', async (req, res) => {
  try {
    let profile = await GamificationProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await GamificationProfile.create({ userId: req.user._id });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Earn points
router.post('/earn', async (req, res) => {
  try {
    const { action, points, description } = req.body;
    if (!action || !points) {
      return res.status(400).json({ message: 'action et points requis.' });
    }

    let profile = await GamificationProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await GamificationProfile.create({ userId: req.user._id });
    }

    profile.points += points;
    profile.pointsHistory.push({ action, points, date: new Date(), description });

    const newLevel = Math.floor(profile.points / 100) + 1;
    if (newLevel > profile.level) {
      profile.level = newLevel;
      await Notification.create({
        userId: req.user._id,
        senderRole: 'system',
        category: 'système',
        type: 'système',
        title: 'Niveau supérieur !',
        message: `Félicitations ! Vous avez atteint le niveau ${newLevel}.`,
        priority: 'medium'
      });
    }

    await profile.save();

    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// List rewards
router.get('/rewards', async (req, res) => {
  try {
    let profile = await GamificationProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await GamificationProfile.create({ userId: req.user._id });
    }

    const rewards = [
      { id: 'consultation_reminder', name: 'Rappel de consultation', cost: 50, description: 'Rappel pour prendre rendez-vous', icon: 'calendar-check' },
      { id: 'priority_booking', name: 'Réservation prioritaire', cost: 100, description: 'Accès prioritaire aux créneaux', icon: 'star' },
      { id: 'free_analysis', name: 'Analyse offerte', cost: 200, description: 'Analyse de document médical gratuite', icon: 'file-medical' },
      { id: 'health_report', name: 'Rapport santé détaillé', cost: 150, description: 'Rapport personnalisé de santé', icon: 'chart-bar' },
      { id: 'consultation_discount', name: 'Réduction consultation', cost: 75, description: '10% de réduction sur une consultation', icon: 'tag' }
    ];

    const availableRewards = rewards.filter(r => profile.points >= r.cost);

    res.json({ success: true, data: { points: profile.points, level: profile.level, rewards: availableRewards, allRewards: rewards } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Redeem reward
router.post('/redeem/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let profile = await GamificationProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profil non trouvé.' });

    const rewardsCosts = { consultation_reminder: 50, priority_booking: 100, free_analysis: 200, health_report: 150, consultation_discount: 75 };
    const rewardNames = { consultation_reminder: 'Rappel de consultation', priority_booking: 'Réservation prioritaire', free_analysis: 'Analyse offerte', health_report: 'Rapport santé détaillé', consultation_discount: 'Réduction consultation' };

    const cost = rewardsCosts[id];
    if (!cost) return res.status(404).json({ message: 'Récompense non trouvée.' });
    if (profile.points < cost) return res.status(400).json({ message: 'Points insuffisants.' });

    profile.points -= cost;
    profile.pointsHistory.push({ action: 'redeem', points: -cost, date: new Date(), description: `Récompense: ${rewardNames[id]}` });
    await profile.save();

    res.json({ success: true, data: { message: 'Récompense échangée.', remainingPoints: profile.points, reward: rewardNames[id] } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

export default router;
