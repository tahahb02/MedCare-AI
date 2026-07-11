import express from 'express';
import GamificationProfile from '../models/GamificationProfile.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect);

const badgeDefinitions = [
  { id: 'first_login', name: 'Premier pas', description: 'Première connexion', icon: 'door-open', points: 10 },
  { id: 'week_streak', name: 'Régulier', description: '7 jours consécutifs', icon: 'fire', points: 50 },
  { id: 'month_streak', name: 'Imperturbable', description: '30 jours consécutifs', icon: 'trophy', points: 200 },
  { id: 'first_appointment', name: 'Premier rendez-vous', description: 'Prise de premier RDV', icon: 'calendar-plus', points: 25 },
  { id: 'complete_profile', name: 'Profil complet', description: 'Profil complété à 100%', icon: 'user-check', points: 30 },
  { id: 'health_warrior', name: 'Guerrier santé', description: '5 défis complétés', icon: 'shield', points: 100 },
  { id: 'referral_master', name: 'Parrain pro', description: '3 parrainages réussis', icon: 'users', points: 75 },
  { id: 'medication_hero', name: 'Héros médicament', description: '30 jours d\'observance', icon: 'pill', points: 150 }
];

const challengeDefinitions = [
  { id: 'ch_login_week', name: 'Connexion quotidienne', description: 'Connectez-vous 7 jours d\'affilée', target: 7, reward: 30, duration: 7 },
  { id: 'ch_appointment', name: 'Consultation régulière', description: 'Prenez 2 rendez-vous ce mois', target: 2, reward: 50, duration: 30 },
  { id: 'ch_profile', name: 'Complétez votre profil', description: 'Ajoutez 5 informations à votre profil', target: 5, reward: 40, duration: 14 },
  { id: 'ch_referral', name: 'Parrainez un ami', description: 'Parrainez 2 personnes', target: 2, reward: 60, duration: 30 }
];

// Get gamification profile
router.get('/profile', async (req, res) => {
  try {
    let profile = await GamificationProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await GamificationProfile.create({ userId: req.user._id });
    }

    const nextLevelPoints = profile.level * 100;
    const progressToNext = ((profile.points % 100) / 100) * 100;

    res.json({
      success: true,
      data: {
        ...profile.toObject(),
        nextLevelPoints,
        progressToNext
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Log an action
router.post('/log', async (req, res) => {
  try {
    const { action, description } = req.body;
    if (!action) return res.status(400).json({ message: 'action requise.' });

    let profile = await GamificationProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await GamificationProfile.create({ userId: req.user._id });
    }

    const actionPoints = {
      login: 5,
      appointment_booked: 10,
      appointment_completed: 15,
      profile_updated: 5,
      document_uploaded: 10,
      medication_logged: 5,
      challenge_completed: 25,
      referral: 50
    };

    const points = actionPoints[action] || 5;
    profile.points += points;
    profile.pointsHistory.push({ action, points, date: new Date(), description });

    const today = new Date().toDateString();
    const lastLog = profile.streak.lastLogDate ? new Date(profile.streak.lastLogDate).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (lastLog === today) {
      // already logged today, no streak change
    } else if (lastLog === yesterday) {
      profile.streak.currentDays += 1;
      if (profile.streak.currentDays > profile.streak.longestDays) {
        profile.streak.longestDays = profile.streak.currentDays;
      }
    } else {
      profile.streak.currentDays = 1;
    }
    profile.streak.lastLogDate = new Date();

    const newLevel = Math.floor(profile.points / 100) + 1;
    if (newLevel > profile.level) {
      profile.level = newLevel;
      await Notification.create({
        userId: req.user._id,
        senderRole: 'system',
        category: 'système',
        type: 'système',
        title: 'Niveau supérieur !',
        message: 'Félicitations ! Vous avez atteint le niveau ' + newLevel + '.',
        priority: 'medium'
      });
    }

    await profile.save();

    res.json({ success: true, data: { points, totalPoints: profile.points, level: profile.level, streak: profile.streak } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Available badges
router.get('/badges', async (req, res) => {
  try {
    let profile = await GamificationProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await GamificationProfile.create({ userId: req.user._id });
    }

    const earned = profile.badges.map(b => b.badgeId);
    const allBadges = badgeDefinitions.map(b => ({
      ...b,
      earned: earned.includes(b.id),
      earnedAt: profile.badges.find(pb => pb.badgeId === b.id)?.earnedAt || null
    }));

    res.json({ success: true, data: { badges: allBadges, totalEarned: earned.length } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Active challenges
router.get('/challenges', async (req, res) => {
  try {
    let profile = await GamificationProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await GamificationProfile.create({ userId: req.user._id });
    }

    const active = profile.challenges.filter(c => !c.completed && new Date(c.endDate) > new Date());

    res.json({ success: true, data: { activeChallenges: active, availableChallenges: challengeDefinitions } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const leaders = await GamificationProfile.find()
      .populate('userId', 'name avatar')
      .sort({ points: -1 })
      .limit(parseInt(limit));

    const leaderboard = leaders.map((l, i) => ({
      rank: i + 1,
      name: l.userId?.name || 'Inconnu',
      avatar: l.userId?.avatar || '',
      points: l.points,
      level: l.level,
      streak: l.streak?.currentDays || 0
    }));

    const myRank = await GamificationProfile.countDocuments({ points: { $gt: 0 } }) + 1;

    res.json({ success: true, data: { leaderboard, myRank } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

export default router;
