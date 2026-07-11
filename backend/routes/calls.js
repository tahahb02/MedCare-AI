import express from 'express';
import VideoCall from '../models/VideoCall.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect);

// Initiate a call
router.post('/initiate', async (req, res) => {
  try {
    const { calleeId, type, conversationId, features } = req.body;
    if (!calleeId || !type) {
      return res.status(400).json({ message: 'calleeId et type requis.' });
    }

    const existing = await VideoCall.findOne({
      $or: [
        { callerId: req.user._id, calleeId, status: { $in: ['ringing', 'en_cours'] } },
        { callerId: calleeId, calleeId: req.user._id, status: { $in: ['ringing', 'en_cours'] } }
      ]
    });

    if (existing) {
      return res.status(409).json({ message: 'Un appel est déjà en cours entre ces utilisateurs.' });
    }

    const call = await VideoCall.create({
      callerId: req.user._id,
      calleeId,
      type,
      conversationId,
      features: features || {},
      status: 'ringing'
    });

    await Notification.create({
      userId: calleeId,
      senderId: req.user._id,
      senderRole: req.user.role,
      category: 'médicale',
      type: 'message',
      title: 'Appel entrant',
      message: `${req.user.name} vous appelle en ${type === 'audio' ? 'audio' : 'vidéo'}.`,
      priority: 'high',
      quickActions: [{ label: 'Répondre', action: 'answer_call', icon: 'phone' }]
    });

    res.status(201).json({ success: true, data: call });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Answer a call
router.post('/:id/answer', async (req, res) => {
  try {
    const call = await VideoCall.findById(req.params.id);
    if (!call) return res.status(404).json({ message: 'Appel non trouvé.' });
    if (call.calleeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }
    if (call.status !== 'ringing') {
      return res.status(400).json({ message: 'Cet appel n\'est plus en attente.' });
    }

    call.status = 'en_cours';
    call.startedAt = new Date();
    await call.save();

    res.json({ success: true, data: call });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// End a call
router.post('/:id/end', async (req, res) => {
  try {
    const call = await VideoCall.findById(req.params.id);
    if (!call) return res.status(404).json({ message: 'Appel non trouvé.' });

    const isParticipant = call.callerId.toString() === req.user._id.toString() || call.calleeId.toString() === req.user._id.toString();
    if (!isParticipant) return res.status(403).json({ message: 'Non autorisé.' });

    call.status = req.body.status === 'refusé' ? 'refusé' : (call.status === 'ringing' ? 'manqué' : 'terminé');
    call.endedAt = new Date();
    if (call.startedAt) {
      call.duration = Math.round((call.endedAt - call.startedAt) / 1000);
    }
    if (req.body.qualityRating) call.qualityRating = req.body.qualityRating;
    await call.save();

    res.json({ success: true, data: call });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Call history
router.get('/history', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {
      $or: [{ callerId: req.user._id }, { calleeId: req.user._id }]
    };
    if (status) query.status = status;

    const calls = await VideoCall.find(query)
      .populate('callerId', 'name email avatar')
      .populate('calleeId', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await VideoCall.countDocuments(query);

    res.json({ success: true, data: { calls, total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// WebRTC signaling
router.post('/signal', async (req, res) => {
  try {
    const { callId, signalData, type } = req.body;
    if (!callId || !signalData) {
      return res.status(400).json({ message: 'callId et signalData requis.' });
    }

    const call = await VideoCall.findById(callId);
    if (!call) return res.status(404).json({ message: 'Appel non trouvé.' });

    const isParticipant = call.callerId.toString() === req.user._id.toString() || call.calleeId.toString() === req.user._id.toString();
    if (!isParticipant) return res.status(403).json({ message: 'Non autorisé.' });

    call.signalData = { ...call.signalData, [type || 'offer']: signalData };
    await call.save();

    res.json({ success: true, data: { message: 'Signal transmis.' } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

export default router;
