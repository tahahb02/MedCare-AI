import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { category, priority, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user._id };
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const unread = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ notifications, unread });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.get('/unread-count', async (req, res) => {
  try {
    const unread = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ unread });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ message: 'Toutes les notifications lues.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { read: true, openedAt: new Date() }, { new: true });
    res.json({ notification: notif });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification supprimée.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

export default router;
