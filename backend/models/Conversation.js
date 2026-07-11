import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, role: { type: String, enum: ['patient', 'medecin', 'admin'] } }],
  type: { type: String, enum: ['privée', 'groupe', 'annonce'], default: 'privée' },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  lastMessage: { content: String, senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, timestamp: Date },
  unreadCount: { patient: { type: Number, default: 0 }, medecin: { type: Number, default: 0 }, admin: { type: Number, default: 0 } },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

conversationSchema.index({ 'participants.userId': 1 });

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['patient', 'medecin', 'admin', 'system'] },
  content: { type: String },
  contentType: { type: String, enum: ['text', 'image', 'document', 'prescription', 'appointment', 'system', 'notification'], default: 'text' },
  attachments: [{ fileUrl: String, fileName: String, fileSize: Number, mimeType: String, cloudinaryId: String }],
  readBy: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, readAt: Date }],
  deliveredAt: Date,
  editedAt: Date,
  deletedAt: Date,
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  reactions: [{ emoji: String, userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: Date }],
  isUrgent: { type: Boolean, default: false },
  mentions: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: -1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);
export const Message = mongoose.model('Message', messageSchema);
