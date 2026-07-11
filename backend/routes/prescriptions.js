import express from 'express';
import Prescription from '../models/Prescription.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const query = req.user.role === 'patient' ? { patientId: req.user._id } : { doctorId: req.user._id };
    const prescriptions = await Prescription.find(query).populate('patientId', 'name').populate('doctorId', 'name').sort({ createdAt: -1 });
    res.json({ prescriptions });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/', authorize('medecin'), async (req, res) => {
  try {
    const prescription = await Prescription.create({ ...req.body, doctorId: req.user._id });
    res.status(201).json({ prescription });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    res.json({ prescription });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.put('/:id', authorize('medecin'), async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ prescription });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

export default router;
