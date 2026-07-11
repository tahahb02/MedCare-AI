import express from 'express';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import Subscription from '../models/Subscription.js';
import Appointment from '../models/Appointment.js';
import MedicalDocument from '../models/MedicalDocument.js';
import SymptomLog from '../models/SymptomLog.js';
import HealthScoreLog from '../models/HealthScoreLog.js';
import GamificationProfile from '../models/GamificationProfile.js';
import HealthCalendarEvent from '../models/HealthCalendarEvent.js';
import { protect, authorize } from '../middlewares/auth.js';
import { checkSubscription } from '../middlewares/subscription.js';

const router = express.Router();
router.use(protect, authorize('patient', 'medecin', 'admin'));

// Profile
router.get('/profile', async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.user._id }).populate('primaryDoctorId', 'name email specializations');
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const profile = await PatientProfile.findOneAndUpdate({ userId: req.user._id }, req.body, { new: true, upsert: true });
    res.json({ message: 'Profil mis à jour.', profile });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Metrics
router.get('/metrics', async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.user._id });
    const appointments = await Appointment.find({ patientId: req.user._id }).sort({ date: -1 }).limit(20);
    const scores = await HealthScoreLog.find({ patientId: req.user._id }).sort({ date: -1 }).limit(30);
    const symptoms = await SymptomLog.find({ patientId: req.user._id }).sort({ date: -1 }).limit(30);

    const healthScore = scores.length > 0 ? scores[0].score : 75;
    const trajectory = scores.length >= 2 ? (scores[0].score > scores[1].score ? 'amélioration' : scores[0].score < scores[1].score ? 'dégradation' : 'stable') : 'stable';

    res.json({
      vitalSigns: {
        bloodPressure: profile?.bloodPressureHistory?.slice(-20) || [],
        weight: profile?.weightHistory?.slice(-20) || [],
        bloodSugar: profile?.bloodSugarHistory?.slice(-20) || [],
        heartRate: profile?.heartRateHistory?.slice(-20) || []
      },
      healthScore, trajectory,
      recentAppointments: appointments,
      symptomTrends: symptoms
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Subscription
router.get('/subscription', async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ patientId: req.user._id });
    res.json({ subscription });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Health Score
router.get('/health-score', async (req, res) => {
  try {
    const scores = await HealthScoreLog.find({ patientId: req.user._id }).sort({ date: -1 }).limit(30);
    res.json({ scores, latest: scores[0] || null });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Gamification
router.get('/gamification', async (req, res) => {
  try {
    let profile = await GamificationProfile.findOne({ userId: req.user._id });
    if (!profile) profile = await GamificationProfile.create({ userId: req.user._id });
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/gamification/log', async (req, res) => {
  try {
    const { action, points, description } = req.body;
    let profile = await GamificationProfile.findOne({ userId: req.user._id });
    if (!profile) profile = await GamificationProfile.create({ userId: req.user._id });

    profile.points += points;
    profile.level = Math.floor(profile.points / 500) + 1;
    profile.pointsHistory.push({ action, points, date: new Date(), description });
    
    if (!profile.streak.lastLogDate || new Date(profile.streak.lastLogDate).toDateString() !== new Date().toDateString()) {
      const yesterday = new Date(Date.now() - 86400000);
      if (profile.streak.lastLogDate && new Date(profile.streak.lastLogDate).toDateString() === yesterday.toDateString()) {
        profile.streak.currentDays += 1;
      } else {
        profile.streak.currentDays = 1;
      }
      profile.streak.lastLogDate = new Date();
      if (profile.streak.currentDays > profile.streak.longestDays) profile.streak.longestDays = profile.streak.currentDays;
    }

    await profile.save();
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Health Calendar
router.get('/health-calendar', async (req, res) => {
  try {
    const events = await HealthCalendarEvent.find({ userId: req.user._id }).sort({ date: 1 });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/health-calendar', async (req, res) => {
  try {
    const event = await HealthCalendarEvent.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ event });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.put('/health-calendar/:id', async (req, res) => {
  try {
    const event = await HealthCalendarEvent.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true });
    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.delete('/health-calendar/:id', async (req, res) => {
  try {
    await HealthCalendarEvent.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Événement supprimé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

export default router;
