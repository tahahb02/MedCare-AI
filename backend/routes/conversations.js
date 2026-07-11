import express from 'express';
import { Conversation, Message } from '../models/Conversation.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const conversations = await Conversation.find({ 'participants.userId': req.user._id, isActive: true })
      .populate('participants.userId', 'name email avatar role')
      .sort({ 'lastMessage.timestamp': -1 });
    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { participantId, participantRole } = req.body;
    let conversation = await Conversation.findOne({
      'participants.userId': { $all: [req.user._id, participantId] },
      type: 'privée'
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [
          { userId: req.user._id, role: req.user.role },
          { userId: participantId, role: participantRole }
        ]
      });
    }
    res.status(201).json({ conversation });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id).populate('participants.userId', 'name email avatar role');
    res.json({ conversation });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.get('/:id/messages', async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id })
      .populate('senderId', 'name avatar role')
      .populate('replyTo', 'content senderId')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/:id/messages', async (req, res) => {
  try {
    const message = await Message.create({
      conversationId: req.params.id,
      senderId: req.user._id,
      senderRole: req.user.role,
      content: req.body.content,
      contentType: req.body.contentType || 'text',
      attachments: req.body.attachments,
      isUrgent: req.body.isUrgent,
      replyTo: req.body.replyTo
    });

    await Conversation.findByIdAndUpdate(req.params.id, {
      lastMessage: { content: req.body.content, senderId: req.user._id, timestamp: new Date() },
      $inc: { [`unreadCount.${req.user.role === 'admin' ? 'admin' : req.user.role}`]: 0 }
    });

    const populated = await Message.findById(message._id).populate('senderId', 'name avatar role');
    res.status(201).json({ message: populated });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    await Message.updateMany({ conversationId: req.params.id, 'readBy.userId': { $ne: req.user._id } }, { $push: { readBy: { userId: req.user._id, readAt: new Date() } } });
    res.json({ message: 'Messages marqués comme lus.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

export default router;
