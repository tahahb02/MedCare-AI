import mongoose from 'mongoose';

const callLogSchema = new mongoose.Schema({
  callerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  calleeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['audio', 'vidéo'], required: true },
  status: { type: String, enum: ['completed', 'missed', 'rejected'], required: true },
  startedAt: { type: Date, required: true },
  endedAt: Date,
  duration: { type: Number, default: 0 },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }
}, { timestamps: true });

callLogSchema.index({ callerId: 1 });
callLogSchema.index({ calleeId: 1 });
callLogSchema.index({ startedAt: -1 });
callLogSchema.index({ conversationId: 1 });

export default mongoose.model('CallLog', callLogSchema);
