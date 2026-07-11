import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  resource: String,
  resourceId: String,
  details: { before: mongoose.Schema.Types.Mixed, after: mongoose.Schema.Types.Mixed },
  ip: String,
  userAgent: String,
  level: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
  sessionId: String
}, { timestamps: true, expiresAt: '365d' });

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
