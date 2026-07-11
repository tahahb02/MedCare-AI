import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';
import { runSubscriptionCron } from './services/subscriptionCron.js';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import patientRoutes from './routes/patients.js';
import doctorRoutes from './routes/doctors.js';
import documentRoutes from './routes/documents.js';
import appointmentRoutes from './routes/appointments.js';
import prescriptionRoutes from './routes/prescriptions.js';
import conversationRoutes from './routes/conversations.js';
import notificationRoutes from './routes/notifications.js';
import symptomRoutes from './routes/symptoms.js';
import analyticsRoutes from './routes/analytics.js';
import callRoutes from './routes/calls.js';
import pdfRoutes from './routes/pdf.js';
import loyaltyRoutes from './routes/loyalty.js';
import referralRoutes from './routes/referral.js';
import ticketRoutes from './routes/tickets.js';
import clinicRoutes from './routes/clinic.js';
import waitingRoomRoutes from './routes/waitingRoom.js';
import newsletterRoutes from './routes/newsletters.js';
import promoCodeRoutes from './routes/promoCodes.js';
import healthCalendarRoutes from './routes/healthCalendar.js';
import coachingRoutes from './routes/coaching.js';
import consentRoutes from './routes/consent.js';
import exportRoutes from './routes/export.js';
import gamificationRoutes from './routes/gamification.js';
import medicationRoutes from './routes/medications.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }
});

app.set('io', io);

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, message: 'Trop de requêtes, réessayez plus tard.' });
app.use('/api/', limiter);
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
app.use('/api/auth/login', loginLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/docteurs', doctorRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/clinic', clinicRoutes);
app.use('/api/waiting-room', waitingRoomRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/promo-codes', promoCodeRoutes);
app.use('/api/health-calendar', healthCalendarRoutes);
app.use('/api/coaching', coachingRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/medications', medicationRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Socket.IO
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join', (userId) => socket.join(`user_${userId}`));
  socket.on('join_conversation', (convId) => socket.join(`conv_${convId}`));
  socket.on('send_message', (data) => { socket.to(`conv_${data.conversationId}`).emit('new_message', data); });
  socket.on('typing', (data) => { socket.to(`conv_${data.conversationId}`).emit('user_typing', data); });
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Cron jobs
cron.schedule('0 8 * * *', () => { console.log('Running subscription cron...'); runSubscriptionCron(); });

// MongoDB
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medcare';

mongoose.connect(MONGODB_URI)
  .then(() => { console.log('MongoDB connected'); httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`)); })
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });

export { io };
