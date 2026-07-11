import express from 'express';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Subscription from '../models/Subscription.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'medecin' });
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'terminé' });
    const activeSubscriptions = await Subscription.countDocuments({ status: 'actif' });
    const revenue = await Subscription.aggregate([{ $match: { status: 'actif' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);

    res.json({
      totalPatients, totalDoctors, totalAppointments, completedAppointments,
      activeSubscriptions, totalRevenue: revenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.get('/revenue', async (req, res) => {
  try {
    const revenue = await Subscription.aggregate([
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    res.json({ revenue });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

export default router;
