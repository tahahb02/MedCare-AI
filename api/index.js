import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from '../backend/routes/auth.js';
import adminRoutes from '../backend/routes/admin.js';
import patientRoutes from '../backend/routes/patients.js';
import doctorRoutes from '../backend/routes/doctors.js';
import documentRoutes from '../backend/routes/documents.js';
import appointmentRoutes from '../backend/routes/appointments.js';
import prescriptionRoutes from '../backend/routes/prescriptions.js';
import conversationRoutes from '../backend/routes/conversations.js';
import notificationRoutes from '../backend/routes/notifications.js';
import symptomRoutes from '../backend/routes/symptoms.js';
import analyticsRoutes from '../backend/routes/analytics.js';
import callRoutes from '../backend/routes/calls.js';
import pdfRoutes from '../backend/routes/pdf.js';
import loyaltyRoutes from '../backend/routes/loyalty.js';
import referralRoutes from '../backend/routes/referral.js';
import ticketRoutes from '../backend/routes/tickets.js';
import clinicRoutes from '../backend/routes/clinic.js';
import waitingRoomRoutes from '../backend/routes/waitingRoom.js';
import newsletterRoutes from '../backend/routes/newsletters.js';
import promoCodeRoutes from '../backend/routes/promoCodes.js';
import healthCalendarRoutes from '../backend/routes/healthCalendar.js';
import coachingRoutes from '../backend/routes/coaching.js';
import consentRoutes from '../backend/routes/consent.js';
import exportRoutes from '../backend/routes/export.js';
import gamificationRoutes from '../backend/routes/gamification.js';
import medicationRoutes from '../backend/routes/medications.js';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

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

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

let cachedConnection;
async function connectDB() {
  if (cachedConnection) return cachedConnection;
  cachedConnection = await mongoose.connect(process.env.MONGODB_URI);
  return cachedConnection;
}

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
