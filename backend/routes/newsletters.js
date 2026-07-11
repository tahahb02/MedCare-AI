import express from 'express';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect, authorize('admin'));

const newsletterStore = [];

// List newsletters
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let filtered = [...newsletterStore];

    if (status) filtered = filtered.filter(n => n.status === status);

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = filtered.length;
    const start = (page - 1) * limit;
    const newsletters = filtered.slice(start, start + parseInt(limit));

    res.json({ success: true, data: { newsletters, total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Create newsletter
router.post('/', async (req, res) => {
  try {
    const { title, subject, content, targetAudience, scheduledFor } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Titre et contenu requis.' });
    }

    const newsletter = {
      _id: `NL-${Date.now()}`,
      title,
      subject: subject || title,
      content,
      targetAudience: targetAudience || 'all',
      status: scheduledFor ? 'scheduled' : 'draft',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      sentAt: null,
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      createdBy: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    newsletterStore.push(newsletter);

    res.status(201).json({ success: true, data: newsletter });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Get newsletter
router.get('/:id', async (req, res) => {
  try {
    const newsletter = newsletterStore.find(n => n._id === req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter non trouvée.' });

    res.json({ success: true, data: newsletter });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Update newsletter
router.put('/:id', async (req, res) => {
  try {
    const newsletter = newsletterStore.find(n => n._id === req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter non trouvée.' });
    if (newsletter.status === 'sent') {
      return res.status(400).json({ message: 'Impossible de modifier une newsletter envoyée.' });
    }

    const allowed = ['title', 'subject', 'content', 'targetAudience', 'scheduledFor'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) newsletter[field] = req.body[field];
    });
    newsletter.updatedAt = new Date();

    res.json({ success: true, data: newsletter });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Delete newsletter
router.delete('/:id', async (req, res) => {
  try {
    const index = newsletterStore.findIndex(n => n._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Newsletter non trouvée.' });
    if (newsletterStore[index].status === 'sent') {
      return res.status(400).json({ message: 'Impossible de supprimer une newsletter envoyée.' });
    }

    newsletterStore.splice(index, 1);

    res.json({ success: true, data: { message: 'Newsletter supprimée.' } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Send newsletter
router.post('/:id/send', async (req, res) => {
  try {
    const newsletter = newsletterStore.find(n => n._id === req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter non trouvée.' });

    const query = { isActive: true };
    if (newsletter.targetAudience === 'patients') query.role = 'patient';
    else if (newsletter.targetAudience === 'doctors') query.role = 'medecin';

    const recipients = await User.find(query).select('_id');

    for (const recipient of recipients) {
      await Notification.create({
        userId: recipient._id,
        senderRole: 'system',
        category: 'promotionnelle',
        type: 'offre_promotionnelle',
        title: newsletter.title,
        message: newsletter.subject,
        priority: 'low'
      });
    }

    newsletter.status = 'sent';
    newsletter.sentAt = new Date();
    newsletter.sentCount = recipients.length;

    res.json({ success: true, data: { message: 'Newsletter envoyée.', sentCount: recipients.length } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Newsletter stats
router.get('/:id/stats', async (req, res) => {
  try {
    const newsletter = newsletterStore.find(n => n._id === req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter non trouvée.' });

    res.json({
      success: true,
      data: {
        _id: newsletter._id,
        title: newsletter.title,
        status: newsletter.status,
        sentAt: newsletter.sentAt,
        sentCount: newsletter.sentCount,
        openCount: newsletter.openCount,
        clickCount: newsletter.clickCount,
        openRate: newsletter.sentCount > 0 ? ((newsletter.openCount / newsletter.sentCount) * 100).toFixed(1) : 0,
        clickRate: newsletter.sentCount > 0 ? ((newsletter.clickCount / newsletter.sentCount) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

export default router;
