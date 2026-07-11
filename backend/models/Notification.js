import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderRole: { type: String, enum: ['system', 'medecin', 'admin'] },
  category: { type: String, enum: ['médicale', 'administrative', 'système', 'promotionnelle'], default: 'système' },
  type: { type: String, enum: ['rendez-vous', 'document', 'message', 'prescription', 'rappel', 'système', 'urgence', 'rappel_abonnement', 'rappel_cabinet', 'rappel_médicament', 'analyse_prête', 'nouveau_patient', 'offre_promotionnelle'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { entityId: String, entityType: String, action: String, actionUrl: String },
  read: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  quickActions: [{ label: String, action: String, icon: String }],
  scheduledFor: Date,
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  groupKey: String,
  groupCount: { type: Number, default: 1 },
  sentVia: [{ channel: { type: String, enum: ['email', 'push', 'inApp', 'sms'] }, sentAt: Date, status: String }],
  openedAt: Date,
  clickedAt: Date
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, category: 1 });

export default mongoose.model('Notification', notificationSchema);
