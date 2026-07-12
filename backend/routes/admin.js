import express from 'express';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import Clinic from '../models/Clinic.js';
import { protect, authorize } from '../middlewares/auth.js';
import { sendWelcomeEmail } from '../utils/sendEmail.js';
import { upload } from '../utils/fileUpload.js';

const router = express.Router();
router.use(protect, authorize('admin'));

// List all active doctors (for secretary/admin to assign patients)
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'medecin', isActive: true }).select('name email avatar');
    const enriched = await Promise.all(doctors.map(async (doc) => {
      const profile = await DoctorProfile.findOne({ userId: doc._id });
      return {
        _id: doc._id,
        name: doc.name,
        email: doc.email,
        avatar: doc.avatar,
        specializations: profile?.specializations || [],
        hospital: profile?.hospital || '',
        currentStatus: profile?.currentStatus || 'disponible',
        consultationFee: profile?.consultationFee || 0,
        rating: profile?.rating || 5,
        totalPatients: profile?.totalPatients || 0
      };
    }));
    res.json({ doctors: enriched });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalPatients, totalDoctors, activeSubscriptions, expiredSubscriptions, suspendedSubscriptions, graceSubscriptions, newPatientsThisMonth, appointmentsThisMonth] = await Promise.all([
      User.countDocuments({ role: 'patient', isActive: true }),
      User.countDocuments({ role: 'medecin', isActive: true }),
      Subscription.countDocuments({ status: 'actif' }),
      Subscription.countDocuments({ status: 'expiré' }),
      Subscription.countDocuments({ status: 'suspendu' }),
      Subscription.countDocuments({ status: 'en_période_de_grâce' }),
      User.countDocuments({ role: 'patient', createdAt: { $gte: monthStart } }),
      Appointment.countDocuments({ createdAt: { $gte: monthStart } })
    ]);

    const monthlyRevenue = await Subscription.aggregate([
      { $match: { status: { $in: ['actif'] }, createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const subscriptionDistribution = await Subscription.aggregate([
      { $group: { _id: '$planType', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);

    const monthlyRevenueHistory = await Subscription.aggregate([
      { $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const patientGrowth = await User.aggregate([
      { $match: { role: 'patient', createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const upcomingPayments = await Subscription.find({ status: 'actif', nextPaymentDate: { $gte: now, $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) } })
      .populate('patientId', 'name email')
      .sort({ nextPaymentDate: 1 })
      .limit(10);

    const expiredNotRenewed = await Subscription.find({ status: 'expiré' })
      .populate('patientId', 'name email')
      .sort({ endDate: 1 })
      .limit(10);

    res.json({
      stats: { totalPatients, totalDoctors, activeSubscriptions, expiredSubscriptions, suspendedSubscriptions, graceSubscriptions, newPatientsThisMonth, appointmentsThisMonth, monthlyRevenue: monthlyRevenue[0]?.total || 0 },
      subscriptionDistribution,
      monthlyRevenueHistory,
      patientGrowth,
      upcomingPayments,
      expiredNotRenewed
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

function generateRandomPassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const specials = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  const all = upper + lower + digits + specials;
  let pw = '';
  pw += upper[Math.floor(Math.random() * upper.length)];
  pw += lower[Math.floor(Math.random() * lower.length)];
  pw += digits[Math.floor(Math.random() * digits.length)];
  pw += specials[Math.floor(Math.random() * specials.length)];
  for (let i = 0; i < 8; i++) pw += all[Math.floor(Math.random() * all.length)];
  return pw.split('').sort(() => Math.random() - 0.5).join('');
}

// Create patient
router.post('/patients', async (req, res) => {
  try {
    const { name, email, phone, dateOfBirth, gender, bloodType, address, city, emergencyContact, insuranceProvider, insuranceNumber, primaryDoctorId, subscription } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Cet email est déjà utilisé.' });

    const patientPassword = generateRandomPassword();
    const user = await User.create({ name, email, password: patientPassword, phone, role: 'patient', isVerified: true, mustChangePassword: true });

    const profileData = { userId: user._id, createdBy: req.user._id };
    if (dateOfBirth) profileData.dateOfBirth = new Date(dateOfBirth);
    if (gender) profileData.gender = gender;
    if (bloodType) profileData.bloodType = bloodType;
    if (address) profileData.address = address;
    if (city) profileData.city = city;
    if (emergencyContact && (emergencyContact.name || emergencyContact.phone)) profileData.emergencyContact = emergencyContact;
    if (insuranceProvider) profileData.insuranceProvider = insuranceProvider;
    if (insuranceNumber) profileData.insuranceNumber = insuranceNumber;
    if (primaryDoctorId) profileData.primaryDoctorId = primaryDoctorId;

    const profile = await PatientProfile.create(profileData);

    if (subscription && subscription.planType) {
      const planDurations = { mensuel: 30, trimestriel: 90, semestre: 180, annuel: 365 };
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + (planDurations[subscription.planType] || 30) * 24 * 60 * 60 * 1000);
      
      await Subscription.create({
        patientId: user._id, planType: subscription.planType, status: 'actif',
        startDate, endDate, nextPaymentDate: endDate,
        amount: subscription.amount || 0, currency: subscription.currency || 'MAD',
        paymentMethod: subscription.paymentMethod || 'especes', createdBy: req.user._id,
        history: [{ date: new Date(), action: 'creation', amount: subscription.amount || 0, performedBy: req.user._id }]
      });
    }

    if (primaryDoctorId) {
      await Notification.create({ userId: primaryDoctorId, senderId: req.user._id, senderRole: 'admin', category: 'administrative', type: 'nouveau_patient', title: 'Nouveau patient assigné', message: `${name} a été assigné(e) à votre patientèle.`, priority: 'medium' });
    }

    sendWelcomeEmail(email, name, email, patientPassword).catch(() => {});

    res.status(201).json({ message: 'Patient créé avec succès.', user: { _id: user._id, name, email: user.email, role: user.role }, profile, temporaryPassword: patientPassword });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// List patients
router.get('/patients', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = { role: 'patient' };
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

    const patients = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const enriched = await Promise.all(patients.map(async (p) => {
      const sub = await Subscription.findOne({ patientId: p._id });
      const profile = await PatientProfile.findOne({ userId: p._id });
      return { ...p.toObject(), subscription: sub, patientProfile: profile };
    }));

    const total = await User.countDocuments(query);
    res.json({ patients: enriched, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Get patient details
router.get('/patients/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Patient non trouvé.' });
    const profile = await PatientProfile.findOne({ userId: user._id });
    const subscription = await Subscription.findOne({ patientId: user._id });
    res.json({ patient: user, profile, subscription });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Update patient
router.put('/patients/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Patient mis à jour.', patient: user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    const { status, planType, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (planType) query.planType = planType;

    const subscriptions = await Subscription.find(query).populate('patientId', 'name email').sort({ endDate: 1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await Subscription.countDocuments(query);

    const calendar = await Subscription.find({ status: 'actif' }).populate('patientId', 'name').select('patientId endDate planType status');

    res.json({ subscriptions, total, page: parseInt(page), pages: Math.ceil(total / limit), calendar });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.put('/subscriptions/:id', async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Abonnement mis à jour.', subscription: sub });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/subscriptions/:id/renew', async (req, res) => {
  try {
    const { planType, amount, paymentMethod } = req.body;
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Abonnement non trouvé.' });

    const planDurations = { mensuel: 30, trimestriel: 90, semestre: 180, annuel: 365 };
    const startDate = sub.endDate > new Date() ? sub.endDate : new Date();
    const endDate = new Date(startDate.getTime() + (planDurations[planType] || 30) * 24 * 60 * 60 * 1000);

    sub.planType = planType || sub.planType;
    sub.status = 'actif';
    sub.startDate = startDate;
    sub.endDate = endDate;
    sub.nextPaymentDate = endDate;
    sub.amount = amount || sub.amount;
    sub.paymentMethod = paymentMethod || sub.paymentMethod;
    sub.alerts = { j30Sent: false, j15Sent: false, j3Sent: false, j0Sent: false, j7Sent: false };
    sub.history.push({ date: new Date(), action: 'renouvellement', amount: sub.amount, performedBy: req.user._id });
    await sub.save();

    await Payment.create({ subscriptionId: sub._id, patientId: sub.patientId, amount: sub.amount, paymentMethod: sub.paymentMethod, status: 'completed', receiptNumber: `RCP-${Date.now()}`, processedBy: req.user._id });

    await Notification.create({ userId: sub.patientId, senderId: req.user._id, senderRole: 'admin', category: 'administrative', type: 'rappel_abonnement', title: 'Abonnement renouvelé', message: `Votre abonnement ${sub.planType} a été renouvelé jusqu'au ${endDate.toLocaleDateString('fr-FR')}.`, priority: 'medium' });

    res.json({ message: 'Abonnement renouvelé.', subscription: sub });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/subscriptions/:id/suspend', async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndUpdate(req.params.id, { status: 'suspendu', $push: { history: { date: new Date(), action: 'suspension', notes: req.body.reason, performedBy: req.user._id } } }, { new: true });
    res.json({ message: 'Abonnement suspendu.', subscription: sub });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/subscriptions/:id/cancel', async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndUpdate(req.params.id, { status: 'annulé', $push: { history: { date: new Date(), action: 'annulation', notes: req.body.reason, performedBy: req.user._id } } }, { new: true });
    res.json({ message: 'Abonnement annulé.', subscription: sub });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unread = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ notifications, unread });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.put('/notifications/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ message: 'Toutes les notifications marquées comme lues.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const { userId, action, page = 1, limit = 50 } = req.query;
    const query = {};
    if (userId) query.userId = userId;
    if (action) query.action = action;

    const logs = await AuditLog.find(query).populate('userId', 'name email role').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await AuditLog.countDocuments(query);
    res.json({ logs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Analytics
router.get('/analytics', async (req, res) => {
  try {
    const now = new Date();
    const [totalRevenue, renewalRate, patientStats] = await Promise.all([
      Subscription.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Subscription.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { role: 'patient' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({ revenue: totalRevenue[0] || { total: 0, count: 0 }, renewalBreakdown: renewalRate, patientStats });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Clinic settings
router.get('/clinic', async (req, res) => {
  try {
    const clinic = await Clinic.findOne().sort({ createdAt: -1 });
    res.json({ clinic });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.put('/clinic', async (req, res) => {
  try {
    let clinic = await Clinic.findOne();
    if (!clinic) clinic = await Clinic.create(req.body);
    else Object.assign(clinic, req.body);
    await clinic.save();
    res.json({ message: 'Clinique mise à jour.', clinic });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Import CSV
router.post('/patients/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier fourni.' });
    const content = req.file.buffer?.toString('utf-8') || '';
    const lines = content.split('\n').filter(l => l.trim());
    if (lines.length < 2) return res.status(400).json({ message: 'CSV vide ou invalide.' });

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    let imported = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

      if (row.email) {
        const exists = await User.findOne({ email: row.email });
        if (!exists) {
          const user = await User.create({
            name: row.name || row.nom || row.prenom || 'Patient importé',
            email: row.email,
            password: row.password || 'MedCare2024!',
            phone: row.phone || row.telephone || '',
            role: 'patient',
            isVerified: true
          });
          await PatientProfile.create({ userId: user._id, gender: row.gender || row.sexe || 'homme', createdBy: req.user._id });
          imported++;
        }
      }
    }

    res.json({ message: 'Import terminé.', imported });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

export default router;
