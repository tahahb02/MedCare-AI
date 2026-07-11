import express from 'express';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middlewares/auth.js';
import { analyzeWithAI } from '../services/aiService.js';

const router = express.Router();
router.use(protect);

// List
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'patient') query.patientId = req.user._id;
    else if (req.user.role === 'medecin') query.doctorId = req.user._id;
    if (req.query.status) query.status = req.query.status;

    const appointments = await Appointment.find(query).populate('patientId', 'name email').populate('doctorId', 'name email').sort({ date: -1 });
    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    const appointment = await Appointment.create({ ...req.body, patientId: req.body.patientId || req.user._id });
    
    const aiResult = await analyzeWithAI(`Consultation type: ${req.body.type}, Motif: ${req.body.reason}, Symptômes: ${req.body.symptoms?.join(', ')}`, 'patient');
    if (aiResult) {
      appointment.aiUrgencyScore = Math.min(100, Math.max(0, (req.body.urgencyDegree === 'critique' ? 90 : req.body.urgencyDegree === 'très_urgent' ? 75 : req.body.urgencyDegree === 'urgent' ? 60 : 40)));
      await appointment.save();
    }

    const targetUserId = req.user.role === 'patient' ? req.body.doctorId : req.body.patientId;
    if (targetUserId) {
      await Notification.create({
        userId: targetUserId, senderId: req.user._id, senderRole: req.user.role,
        category: 'médicale', type: 'rendez-vous',
        title: 'Nouveau rendez-vous',
        message: `Rendez-vous ${req.body.type || 'consultation'} prévu le ${new Date(req.body.date).toLocaleDateString('fr-FR')}`,
        priority: 'medium'
      });
    }

    res.status(201).json({ appointment });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Cancel
router.put('/:id/cancel', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: 'annulé', cancelReason: req.body.reason, cancelBy: req.user.role }, { new: true });
    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Complete
router.put('/:id/complete', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: 'terminé', doctorNotes: req.body.doctorNotes, postConsultation: req.body.postConsultation }, { new: true });
    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

export default router;
