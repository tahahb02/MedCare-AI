import express from 'express';
import HealthCalendarEvent from '../models/HealthCalendarEvent.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect);

// List events
router.get('/', async (req, res) => {
  try {
    const { type, from, to, page = 1, limit = 50 } = req.query;
    const query = { userId: req.user._id };
    if (type) query.type = type;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const events = await HealthCalendarEvent.find(query)
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await HealthCalendarEvent.countDocuments(query);

    res.json({ events, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Create event
router.post('/', async (req, res) => {
  try {
    const { title, description, type, date, endDate, reminderBefore, recurring, color, linkedEntityId, linkedEntityType, time, reminder } = req.body;
    if (!title || !date) {
      return res.status(400).json({ message: 'title et date requis.' });
    }

    const typeMap = { medication: 'médicament', medicament: 'médicament', appointment: 'rendez-vous', reminder: 'rappel', exercise: 'exercice', bilan: 'bilan', vaccination: 'vaccination' };
    const normalizedType = typeMap[type] || type || 'rappel';

    let eventDate = new Date(date);
    if (time && typeof time === 'string') {
      const [hours, minutes] = time.split(':').map(Number);
      eventDate.setUTCHours(hours || 0, minutes || 0, 0, 0);
    }

    const event = await HealthCalendarEvent.create({
      userId: req.user._id,
      title,
      description,
      type: normalizedType,
      date: eventDate,
      endDate: endDate ? new Date(endDate) : undefined,
      reminderBefore: reminder !== undefined ? (reminder ? 60 : 0) : reminderBefore,
      recurring,
      color,
      linkedEntityId,
      linkedEntityType
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Update event
router.put('/:id', async (req, res) => {
  try {
    const event = await HealthCalendarEvent.findOne({ _id: req.params.id, userId: req.user._id });
    if (!event) return res.status(404).json({ message: 'Événement non trouvé.' });

    Object.assign(event, req.body);
    await event.save();

    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const event = await HealthCalendarEvent.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!event) return res.status(404).json({ message: 'Événement non trouvé.' });

    res.json({ success: true, data: { message: 'Événement supprimé.' } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Sync external calendar
router.post('/sync', async (req, res) => {
  try {
    const { events: externalEvents, source } = req.body;
    if (!externalEvents || !Array.isArray(externalEvents)) {
      return res.status(400).json({ message: 'Tableau d\'événements requis.' });
    }

    const synced = [];
    for (const ext of externalEvents) {
      const event = await HealthCalendarEvent.create({
        userId: req.user._id,
        title: ext.title,
        description: ext.description,
        type: ext.type || 'rappel',
        date: new Date(ext.date),
        endDate: ext.endDate ? new Date(ext.endDate) : undefined,
        color: ext.color,
        linkedEntityId: ext.id
      });
      synced.push(event);
    }

    res.json({ success: true, data: { synced: synced.length, source: source || 'external' } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Export .ics file
router.get('/export', async (req, res) => {
  try {
    const events = await HealthCalendarEvent.find({ userId: req.user._id }).sort({ date: 1 });

    let ical = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//MedCare AI//Health Calendar//FR\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n';

    for (const event of events) {
      const dtStart = event.date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const uid = `${event._id}@medcare-ai.com`;
      ical += `BEGIN:VEVENT\r\nUID:${uid}\r\nDTSTART:${dtStart}\r\nSUMMARY:${event.title}\r\nDESCRIPTION:${event.description || ''}\r\n`;
      if (event.endDate) {
        const dtEnd = event.endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        ical += `DTEND:${dtEnd}\r\n`;
      }
      ical += `CATEGORIES:${event.type}\r\nEND:VEVENT\r\n`;
    }

    ical += 'END:VCALENDAR\r\n';

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="medcare-calendar.ics"');
    res.send(ical);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

export default router;
