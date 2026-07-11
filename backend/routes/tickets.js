import express from 'express';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect);

const ticketStore = [];

// List tickets
router.get('/', async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    let filtered = [...ticketStore];

    if (req.user.role === 'patient') {
      filtered = filtered.filter(t => t.patientId.toString() === req.user._id.toString());
    }

    if (status) filtered = filtered.filter(t => t.status === status);
    if (priority) filtered = filtered.filter(t => t.priority === priority);

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = filtered.length;
    const start = (page - 1) * limit;
    const tickets = filtered.slice(start, start + parseInt(limit));

    res.json({ success: true, data: { tickets, total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Create ticket
router.post('/', async (req, res) => {
  try {
    const { subject, description, category, priority, attachments } = req.body;
    if (!subject || !description) {
      return res.status(400).json({ message: 'Sujet et description requis.' });
    }

    const ticket = {
      _id: `TKT-${Date.now()}`,
      patientId: req.user._id,
      patientName: req.user.name,
      subject,
      description,
      category: category || 'général',
      priority: priority || 'medium',
      status: 'ouvert',
      attachments: attachments || [],
      messages: [{ senderId: req.user._id, senderName: req.user.name, senderRole: req.user.role, content: description, createdAt: new Date() }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    ticketStore.push(ticket);

    await Notification.create({
      userId: req.user._id,
      senderRole: 'system',
      category: 'administrative',
      type: 'système',
      title: 'Ticket créé',
      message: `Votre ticket "${subject}" a été créé avec succès.`,
      priority: 'low'
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Get ticket
router.get('/:id', async (req, res) => {
  try {
    const ticket = ticketStore.find(t => t._id === req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé.' });

    if (req.user.role === 'patient' && ticket.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Update ticket
router.put('/:id', async (req, res) => {
  try {
    const ticket = ticketStore.find(t => t._id === req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé.' });

    if (req.user.role === 'patient' && ticket.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }

    const allowed = ['status', 'priority', 'assignedTo'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) ticket[field] = req.body[field];
    });
    ticket.updatedAt = new Date();

    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Add message to ticket
router.post('/:id/messages', async (req, res) => {
  try {
    const ticket = ticketStore.find(t => t._id === req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé.' });

    if (req.user.role === 'patient' && ticket.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }

    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Message requis.' });

    const message = { senderId: req.user._id, senderName: req.user.name, senderRole: req.user.role, content, createdAt: new Date() };
    ticket.messages.push(message);
    ticket.updatedAt = new Date();

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

export default router;
