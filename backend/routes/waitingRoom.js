import express from 'express';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect);

// Get waiting room queue (doctor view)
router.get('/', authorize('medecin', 'admin'), async (req, res) => {
  try {
    const query = { doctorId: req.user._id, status: 'en_salle_attente' };
    if (req.query.date) {
      const dayStart = new Date(req.query.date);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      query.date = { $gte: dayStart, $lt: dayEnd };
    }

    const queue = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .sort({ 'waitingRoom.joinedAt': 1 });

    const enriched = queue.map((apt, index) => ({
      ...apt.toObject(),
      waitingRoom: { ...apt.waitingRoom, position: index + 1 }
    }));

    res.json({ success: true, data: { queue: enriched, total: enriched.length } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Join waiting room (patient)
router.post('/join', async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) return res.status(400).json({ message: 'appointmentId requis.' });

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Rendez-vous non trouvé.' });
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }

    const queueCount = await Appointment.countDocuments({ doctorId: appointment.doctorId, status: 'en_salle_attente' });

    appointment.status = 'en_salle_attente';
    appointment.waitingRoom = {
      joinedAt: new Date(),
      position: queueCount + 1,
      estimatedWaitTime: (queueCount + 1) * 15,
      status: 'waiting'
    };
    await appointment.save();

    await Notification.create({
      userId: appointment.doctorId,
      senderId: req.user._id,
      senderRole: 'patient',
      category: 'médicale',
      type: 'rendez-vous',
      title: 'Patient en salle d\'attente',
      message: `${req.user.name} a rejoint la salle d'attente virtuelle.`,
      priority: 'medium'
    });

    res.json({ success: true, data: { position: appointment.waitingRoom.position, estimatedWaitTime: appointment.waitingRoom.estimatedWaitTime } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Get current position (patient)
router.get('/position', async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      patientId: req.user._id,
      status: 'en_salle_attente'
    }).sort({ 'waitingRoom.joinedAt': -1 }).populate('doctorId', 'name');

    if (!appointment) {
      return res.json({ success: true, data: { inQueue: false } });
    }

    const aheadCount = await Appointment.countDocuments({
      doctorId: appointment.doctorId._id,
      status: 'en_salle_attente',
      'waitingRoom.joinedAt': { $lt: appointment.waitingRoom.joinedAt }
    });

    res.json({
      success: true,
      data: {
        inQueue: true,
        appointmentId: appointment._id,
        doctorName: appointment.doctorId.name,
        position: aheadCount + 1,
        estimatedWaitTime: (aheadCount + 1) * 15,
        joinedAt: appointment.waitingRoom.joinedAt,
        status: appointment.waitingRoom.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Notify patient (doctor)
router.post('/notify', authorize('medecin', 'admin'), async (req, res) => {
  try {
    const { appointmentId, message } = req.body;
    if (!appointmentId) return res.status(400).json({ message: 'appointmentId requis.' });

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Rendez-vous non trouvé.' });
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }

    appointment.waitingRoom.status = 'notified';
    appointment.waitingRoom.notifiedAt = new Date();
    await appointment.save();

    await Notification.create({
      userId: appointment.patientId,
      senderId: req.user._id,
      senderRole: 'medecin',
      category: 'médicale',
      type: 'rendez-vous',
      title: 'C\'est votre tour !',
      message: message || `${req.user.name} vous invite à entrer pour votre consultation.`,
      priority: 'high'
    });

    res.json({ success: true, data: { message: 'Patient notifié.' } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

export default router;
