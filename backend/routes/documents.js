import express from 'express';
import MedicalDocument from '../models/MedicalDocument.js';
import { protect, authorize } from '../middlewares/auth.js';
import { upload } from '../utils/fileUpload.js';
import { generateDocumentAnalysis } from '../services/aiService.js';

const router = express.Router();
router.use(protect);

// Upload document
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { patientId, type, category, name } = req.body;
    const doc = await MedicalDocument.create({
      patientId: patientId || req.user._id,
      doctorId: req.user.role === 'medecin' ? req.user._id : undefined,
      name: name || req.file.originalname,
      originalName: req.file.originalname,
      type: type || 'autre',
      category: category || 'autre',
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'uploaded'
    });

    const analysis = await generateDocumentAnalysis(req.file.originalname, type || 'autre');
    if (analysis) {
      doc.aiAnalysis = { summary: analysis.text, generatedAt: new Date(), provider: analysis.provider, confidence: 75, urgencyLevel: 'routine' };
      doc.status = 'ai_reviewed';
      await doc.save();
    }

    res.status(201).json({ document: doc });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// List documents
router.get('/', async (req, res) => {
  try {
    const { patientId, status } = req.query;
    const query = {};
    if (req.user.role === 'patient') query.patientId = req.user._id;
    else if (patientId) query.patientId = patientId;
    if (status) query.status = status;

    const documents = await MedicalDocument.find(query).populate('patientId', 'name').sort({ createdAt: -1 });
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Get single document
router.get('/:id', async (req, res) => {
  try {
    const doc = await MedicalDocument.findById(req.params.id).populate('patientId', 'name email').populate('doctorAnalysis.doctorId', 'name');
    if (!doc) return res.status(404).json({ message: 'Document non trouvé.' });
    res.json({ document: doc });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Doctor analysis
router.put('/:id/doctor', async (req, res) => {
  try {
    const doc = await MedicalDocument.findByIdAndUpdate(req.params.id, {
      doctorAnalysis: { ...req.body, doctorId: req.user._id, reviewedAt: new Date() },
      status: 'doctor_reviewed'
    }, { new: true });
    res.json({ document: doc });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await MedicalDocument.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document supprimé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

export default router;
