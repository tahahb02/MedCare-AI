import express from 'express';
import Clinic from '../models/Clinic.js';
import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Appointment from '../models/Appointment.js';
import Subscription from '../models/Subscription.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect, authorize('admin'));

// Get clinic settings
router.get('/', async (req, res) => {
  try {
    const clinic = await Clinic.findOne().sort({ createdAt: -1 });
    if (!clinic) return res.status(404).json({ message: 'Aucune clinique configurée.' });

    res.json({ success: true, data: clinic });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Update clinic settings
router.put('/', async (req, res) => {
  try {
    let clinic = await Clinic.findOne();
    if (!clinic) {
      clinic = await Clinic.create({ name: req.body.name || 'MedCare Clinic', ...req.body });
    } else {
      Object.assign(clinic, req.body);
      await clinic.save();
    }

    res.json({ success: true, data: clinic });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Clinic statistics
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalDoctors, totalPatients, appointmentsToday, appointmentsThisMonth, activeSubscriptions, revenueThisMonth, recentAppointments] = await Promise.all([
      User.countDocuments({ role: 'medecin', isActive: true }),
      User.countDocuments({ role: 'patient', isActive: true }),
      Appointment.countDocuments({ date: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()), $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) } }),
      Appointment.countDocuments({ createdAt: { $gte: monthStart } }),
      Subscription.countDocuments({ status: 'actif' }),
      Subscription.aggregate([
        { $match: { status: 'actif', createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Appointment.find({ date: { $gte: weekStart } }).sort({ date: -1 }).limit(10).populate('patientId', 'name').populate('doctorId', 'name')
    ]);

    res.json({
      success: true,
      data: {
        totalDoctors,
        totalPatients,
        appointmentsToday,
        appointmentsThisMonth,
        activeSubscriptions,
        revenueThisMonth: revenueThisMonth[0]?.total || 0,
        recentAppointments
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// List clinic doctors
router.get('/doctors', async (req, res) => {
  try {
    const { specialization, available } = req.query;
    const query = { role: 'medecin', isActive: true };

    const doctors = await User.find(query).select('name email phone avatar');

    const enriched = await Promise.all(doctors.map(async (doc) => {
      const profile = await DoctorProfile.findOne({ userId: doc._id });
      return { ...doc.toObject(), profile };
    }));

    let filtered = enriched;
    if (specialization) {
      filtered = enriched.filter(d => d.profile?.specializations?.some(s => s.name.toLowerCase().includes(specialization.toLowerCase())));
    }

    res.json({ success: true, data: filtered });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

export default router;
