import express from 'express';
import MedicationReminder from '../models/MedicationReminder.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect);

// List medications
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'medecin') {
      query.patientId = req.query.patientId;
    }
    if (req.query.active !== undefined) query.active = req.query.active === 'true';

    const medications = await MedicationReminder.find(query)
      .populate('prescriptionId', 'diagnosis medications')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: medications });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Create reminder
router.post('/', async (req, res) => {
  try {
    const { patientId, name, dosage, frequency, times, startDate, endDate, remainingQuantity, refillReminderAt, prescriptionId } = req.body;
    if (!name) return res.status(400).json({ message: 'Nom du médicament requis.' });

    const targetPatient = req.user.role === 'patient' ? req.user._id : patientId;
    if (!targetPatient) return res.status(400).json({ message: 'patientId requis.' });

    const reminder = await MedicationReminder.create({
      patientId: targetPatient,
      prescriptionId,
      name,
      dosage,
      frequency,
      times,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      remainingQuantity,
      refillReminderAt: refillReminderAt ? new Date(refillReminderAt) : undefined
    });

    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Update reminder
router.put('/:id', async (req, res) => {
  try {
    const reminder = await MedicationReminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Rappel non trouvé.' });

    if (req.user.role === 'patient' && reminder.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }

    Object.assign(reminder, req.body);
    await reminder.save();

    res.json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Delete reminder
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await MedicationReminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Rappel non trouvé.' });

    if (req.user.role === 'patient' && reminder.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }

    await MedicationReminder.findByIdAndDelete(req.params.id);

    res.json({ success: true, data: { message: 'Rappel supprimé.' } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Get adherence data
router.get('/adherence', async (req, res) => {
  try {
    const targetPatient = req.user.role === 'patient' ? req.user._id : req.query.patientId;
    if (!targetPatient) return res.status(400).json({ message: 'patientId requis.' });

    const reminders = await MedicationReminder.find({ patientId: targetPatient, active: true });

    const adherenceData = reminders.map(r => {
      const log = r.adherenceLog || [];
      const total = log.length;
      const taken = log.filter(l => l.taken).length;
      const rate = total > 0 ? Math.round((taken / total) * 100) : 0;

      return {
        medicationId: r._id,
        name: r.name,
        dosage: r.dosage,
        totalDoses: total,
        dosesTaken: taken,
        dosesMissed: total - taken,
        adherenceRate: rate,
        recentLog: log.slice(-7)
      };
    });

    const overallRate = adherenceData.length > 0
      ? Math.round(adherenceData.reduce((sum, d) => sum + d.adherenceRate, 0) / adherenceData.length)
      : 0;

    res.json({ success: true, data: { medications: adherenceData, overallAdherenceRate: overallRate } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Request refill
router.post('/refill', async (req, res) => {
  try {
    const { medicationId, notes } = req.body;
    if (!medicationId) return res.status(400).json({ message: 'medicationId requis.' });

    const reminder = await MedicationReminder.findById(medicationId);
    if (!reminder) return res.status(404).json({ message: 'Médicament non trouvé.' });

    if (req.user.role === 'patient' && reminder.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }

    const targetUserId = req.user.role === 'patient' ? reminder.patientId : req.user._id;

    await Notification.create({
      userId: targetUserId,
      senderId: req.user._id,
      senderRole: req.user.role,
      category: 'médicale',
      type: 'rappel_médicament',
      title: 'Demande de renouvellement',
      message: 'Demande de renouvellement pour ' + reminder.name + (notes ? ' - ' + notes : ''),
      priority: 'medium'
    });

    res.json({ success: true, data: { message: 'Demande de renouvellement envoyée.' } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

export default router;
