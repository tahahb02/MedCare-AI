import express from 'express';
import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';
import PatientProfile from '../models/PatientProfile.js';
import Appointment from '../models/Appointment.js';
import MedicalDocument from '../models/MedicalDocument.js';
import ClinicalDecision from '../models/ClinicalDecision.js';
import { protect, authorize } from '../middlewares/auth.js';
import { analyzeWithAI, checkDrugInteractions } from '../services/aiService.js';

const router = express.Router();
router.use(protect, authorize('medecin', 'admin'));

// Profile
router.get('/profile', async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({ userId: req.user._id });
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const profile = await DoctorProfile.findOneAndUpdate({ userId: req.user._id }, req.body, { new: true, upsert: true });
    res.json({ message: 'Profil mis à jour.', profile });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Patients list
router.get('/patients', async (req, res) => {
  try {
    const profiles = await PatientProfile.find({ primaryDoctorId: req.user._id }).populate('userId', 'name email phone avatar isActive');
    res.json({ patients: profiles });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Single patient
router.get('/patients/:id', async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.params.id }).populate('userId', 'name email phone avatar');
    const appointments = await Appointment.find({ patientId: req.params.id, doctorId: req.user._id }).sort({ date: -1 });
    const documents = await MedicalDocument.find({ patientId: req.params.id }).sort({ createdAt: -1 });
    res.json({ patient: profile, appointments, documents });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Status update
router.put('/status', async (req, res) => {
  try {
    const { currentStatus, statusMessage, estimatedAvailableAt } = req.body;
    const profile = await DoctorProfile.findOneAndUpdate(
      { userId: req.user._id },
      { currentStatus, statusMessage, estimatedAvailableAt, statusUpdatedAt: new Date() },
      { new: true }
    );
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Clinical decision
router.post('/clinical-decision', async (req, res) => {
  try {
    const { patientId, symptoms, analyses, history, medications } = req.body;
    const result = await analyzeWithAI(
      `Patient ID: ${patientId}\nSymptômes: ${symptoms?.join(', ')}\nAnalyses: ${analyses}\nAntécédents: ${history}\nMédicaments: ${medications}`,
      'doctor'
    );
    const decision = await ClinicalDecision.create({
      patientId, doctorId: req.user._id,
      type: 'diagnostic_différentiel',
      input: { symptoms, analyses: [analyses], antécédents: [history], médicaments: medications },
      result: { recommendations: [{ title: 'Analyse IA', description: result.text, priority: 'haute', source: 'MedCare AI' }] },
      provider: result.provider, confidence: 75
    });
    res.json({ decision });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Drug interactions
router.post('/drug-interactions', async (req, res) => {
  try {
    const { medications } = req.body;
    const result = await checkDrugInteractions(medications);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Send notification to patient
router.post('/send-to-patient', async (req, res) => {
  try {
    const { patientId, title, message } = req.body;
    const Notification = (await import('../models/Notification.js')).default;
    const notif = await Notification.create({
      userId: patientId, senderId: req.user._id, senderRole: 'medecin',
      category: 'médicale', type: 'rappel_cabinet', title, message, priority: 'high'
    });
    res.json({ notification: notif });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Stats
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const user = await User.findById(req.user._id).select('name');
    const [todayAppointments, totalPatients, pendingDocs, unreadMessages] = await Promise.all([
      Appointment.countDocuments({ doctorId: req.user._id, date: { $gte: today, $lt: new Date(today.getTime() + 86400000) } }),
      PatientProfile.countDocuments({ primaryDoctorId: req.user._id }),
      MedicalDocument.countDocuments({ doctorId: req.user._id, status: 'uploaded' }),
      0
    ]);
    res.json({ name: user?.name, todayAppointments, totalPatients, pendingDocs, unreadMessages });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Cohort view
router.get('/cohort', async (req, res) => {
  try {
    const patients = await PatientProfile.find({ primaryDoctorId: req.user._id }).populate('userId', 'name email');
    const alerts = [];
    const pathologyCount = {};
    patients.forEach(p => {
      (p.chronicConditions || []).forEach(c => { pathologyCount[c.name] = (pathologyCount[c.name] || 0) + 1; });
    });
    res.json({ patients, alerts, pathologyCount });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

export default router;
