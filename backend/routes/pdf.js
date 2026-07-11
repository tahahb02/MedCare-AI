import express from 'express';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import Prescription from '../models/Prescription.js';
import MedicalDocument from '../models/MedicalDocument.js';
import Appointment from '../models/Appointment.js';
import Subscription from '../models/Subscription.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect);

// Generate full patient PDF
router.get('/patient/:id', authorize('medecin', 'admin'), async (req, res) => {
  try {
    const patientId = req.params.id;
    const user = await User.findById(patientId);
    if (!user) return res.status(404).json({ message: 'Patient non trouvé.' });

    const [profile, prescriptions, documents, appointments, subscription] = await Promise.all([
      PatientProfile.findOne({ userId: patientId }),
      Prescription.find({ patientId }).sort({ createdAt: -1 }),
      MedicalDocument.find({ patientId }).sort({ createdAt: -1 }),
      Appointment.find({ patientId }).sort({ date: -1 }).limit(20),
      Subscription.findOne({ patientId })
    ]);

    const patientData = {
      patient: { _id: user._id, name: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt },
      profile,
      prescriptions,
      documents,
      appointments,
      subscription,
      generatedAt: new Date(),
      generatedBy: req.user._id
    };

    res.json({ success: true, data: patientData });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Selective export
router.post('/patient/:id/selective', authorize('medecin', 'admin'), async (req, res) => {
  try {
    const patientId = req.params.id;
    const { sections, dateFrom, dateTo } = req.body;

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ message: 'Au moins une section requise.' });
    }

    const user = await User.findById(patientId);
    if (!user) return res.status(404).json({ message: 'Patient non trouvé.' });

    const dateFilter = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) dateFilter.$lte = new Date(dateTo);

    const data = { patient: { _id: user._id, name: user.name, email: user.email }, sections: {} };

    if (sections.includes('profile')) {
      data.sections.profile = await PatientProfile.findOne({ userId: patientId });
    }
    if (sections.includes('prescriptions')) {
      const query = { patientId };
      if (dateFrom || dateTo) query.createdAt = dateFilter;
      data.sections.prescriptions = await Prescription.find(query).sort({ createdAt: -1 });
    }
    if (sections.includes('documents')) {
      const query = { patientId };
      if (dateFrom || dateTo) query.createdAt = dateFilter;
      data.sections.documents = await MedicalDocument.find(query).sort({ createdAt: -1 });
    }
    if (sections.includes('appointments')) {
      const query = { patientId };
      if (dateFrom || dateTo) query.date = dateFilter;
      data.sections.appointments = await Appointment.find(query).sort({ date: -1 });
    }
    if (sections.includes('subscription')) {
      data.sections.subscription = await Subscription.findOne({ patientId });
    }

    data.generatedAt = new Date();
    data.generatedBy = req.user._id;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

export default router;
