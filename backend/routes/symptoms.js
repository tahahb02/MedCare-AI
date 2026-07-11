import express from 'express';
import SymptomLog from '../models/SymptomLog.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const logs = await SymptomLog.find({ patientId: req.user._id }).sort({ date: -1 }).limit(50);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const log = await SymptomLog.create({ ...req.body, patientId: req.user._id });
    res.status(201).json({ log });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/quick-log', async (req, res) => {
  try {
    const log = await SymptomLog.create({
      patientId: req.user._id,
      quickLog: req.body.quickLog,
      mood: req.body.quickLog.mood,
      painLevel: req.body.quickLog.painLevel,
      energyLevel: req.body.quickLog.energyLevel
    });
    res.status(201).json({ log });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.get('/trends', async (req, res) => {
  try {
    const logs = await SymptomLog.find({ patientId: req.user._id }).sort({ date: 1 });
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

export default router;
