import express from 'express';
import PatientProfile from '../models/PatientProfile.js';
import AuditLog from '../models/AuditLog.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect);

// Get consent status
router.get('/', async (req, res) => {
  try {
    let profile = await PatientProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await PatientProfile.create({ userId: req.user._id });
    }

    const consents = profile.consents || {
      dataProcessing: false,
      marketingConsent: false,
      dataRetentionConsent: false,
      thirdPartySharing: false
    };

    res.json({ success: true, data: consents });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Record consent
router.post('/', async (req, res) => {
  try {
    const { type, granted } = req.body;
    if (!type || granted === undefined) {
      return res.status(400).json({ message: 'type et granted requis.' });
    }

    const consentTypes = ['dataProcessing', 'marketingConsent', 'dataRetentionConsent', 'thirdPartySharing'];
    if (!consentTypes.includes(type)) {
      return res.status(400).json({ message: `Type invalide. Valeurs acceptées: ${consentTypes.join(', ')}` });
    }

    let profile = await PatientProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await PatientProfile.create({ userId: req.user._id });
    }

    const dateField = `${type}Date`;
    profile.consents[type] = granted;
    profile.consents[dateField] = new Date();
    await profile.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'consent_update',
      resource: 'PatientProfile',
      resourceId: profile._id.toString(),
      details: { before: { [type]: !granted }, after: { [type]: granted } },
      level: 'info'
    });

    res.json({ success: true, data: { [type]: granted, updatedAt: profile.consents[dateField] } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Consent history
router.get('/history', async (req, res) => {
  try {
    const logs = await AuditLog.find({
      userId: req.user._id,
      action: 'consent_update'
    }).sort({ createdAt: -1 }).limit(50);

    const history = logs.map(log => ({
      type: Object.keys(log.details.after || {})[0],
      granted: Object.values(log.details.after || {})[0],
      date: log.createdAt
    }));

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

export default router;
