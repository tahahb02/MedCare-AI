import express from 'express';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import Subscription from '../models/Subscription.js';
import Appointment from '../models/Appointment.js';
import AuditLog from '../models/AuditLog.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect, authorize('admin'));

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  return String(val).replace(/"/g, '""');
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR');
}

// Export patients
router.get('/patients', async (req, res) => {
  try {
    const { format = 'csv' } = req.query;

    const users = await User.find({ role: 'patient' }).select('name email phone createdAt isActive');
    const profiles = await Promise.all(users.map(async (u) => {
      const profile = await PatientProfile.findOne({ userId: u._id });
      return { ...u.toObject(), profile };
    }));

    if (format === 'csv') {
      let csv = 'Nom,Email,Telephone,Date de naissance,Genre,Groupe sanguin,Ville,Actif,Cree le\n';
      for (const p of profiles) {
        const row = [
          escapeCsv(p.name),
          escapeCsv(p.email),
          escapeCsv(p.phone),
          escapeCsv(formatDate(p.profile?.dateOfBirth)),
          escapeCsv(p.profile?.gender),
          escapeCsv(p.profile?.bloodType),
          escapeCsv(p.profile?.city),
          escapeCsv(p.isActive),
          escapeCsv(formatDate(p.createdAt))
        ].join(',');
        csv += row + '\n';
      }
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="patients-export.csv"');
      return res.send('\uFEFF' + csv);
    }

    res.json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Export subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    const { format = 'csv', status } = req.query;
    const query = {};
    if (status) query.status = status;

    const subscriptions = await Subscription.find(query)
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      let csv = 'Patient,Email,Plan,Statut,Montant,Date debut,Date fin,Paiement suivant\n';
      for (const sub of subscriptions) {
        const row = [
          escapeCsv(sub.patientId?.name),
          escapeCsv(sub.patientId?.email),
          escapeCsv(sub.planType),
          escapeCsv(sub.status),
          escapeCsv(sub.amount),
          escapeCsv(formatDate(sub.startDate)),
          escapeCsv(formatDate(sub.endDate)),
          escapeCsv(formatDate(sub.nextPaymentDate))
        ].join(',');
        csv += row + '\n';
      }
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="subscriptions-export.csv"');
      return res.send('\uFEFF' + csv);
    }

    res.json({ success: true, data: subscriptions });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Export analytics
router.get('/analytics', async (req, res) => {
  try {
    const { format = 'csv', period } = req.query;
    const now = new Date();
    const query = {};
    if (period === 'month') query.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    else if (period === 'year') query.createdAt = { $gte: new Date(now.getFullYear(), 0, 1) };

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .sort({ date: -1 });

    if (format === 'csv') {
      let csv = 'Patient,Medecin,Date,Type,Statut,URgence,Fee\n';
      for (const apt of appointments) {
        const row = [
          escapeCsv(apt.patientId?.name),
          escapeCsv(apt.doctorId?.name),
          escapeCsv(formatDate(apt.date)),
          escapeCsv(apt.type),
          escapeCsv(apt.status),
          escapeCsv(apt.urgencyDegree),
          escapeCsv(apt.consultationFee)
        ].join(',');
        csv += row + '\n';
      }
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics-export.csv"');
      return res.send('\uFEFF' + csv);
    }

    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Export audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const { format = 'csv', action, page = 1, limit = 100 } = req.query;
    const query = {};
    if (action) query.action = action;

    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    if (format === 'csv') {
      let csv = 'Utilisateur,Email,Role,Action,Resource,Date,Niveau\n';
      for (const log of logs) {
        const row = [
          escapeCsv(log.userId?.name),
          escapeCsv(log.userId?.email),
          escapeCsv(log.userId?.role),
          escapeCsv(log.action),
          escapeCsv(log.resource),
          escapeCsv(formatDate(log.createdAt)),
          escapeCsv(log.level)
        ].join(',');
        csv += row + '\n';
      }
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-logs-export.csv"');
      return res.send('\uFEFF' + csv);
    }

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

export default router;
