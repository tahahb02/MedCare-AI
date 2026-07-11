import mongoose from 'mongoose';

const videoCallSchema = new mongoose.Schema({
  callerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  calleeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  type: { type: String, enum: ['audio', 'vidéo'], required: true },
  status: { type: String, enum: ['ringing', 'en_cours', 'manqué', 'terminé', 'refusé'], default: 'ringing' },
  startedAt: Date,
  endedAt: Date,
  duration: { type: Number, default: 0 },
  signalData: { type: mongoose.Schema.Types.Mixed },
  features: {
    screenSharing: { type: Boolean, default: false },
    recording: { type: Boolean, default: false },
    whiteboard: { type: Boolean, default: false },
    fileTransfer: { type: Boolean, default: false },
    textChat: { type: Boolean, default: false },
    noiseReduction: { type: Boolean, default: false }
  },
  recordingUrl: { type: String },
  recordingConsent: {
    callerConsent: { type: Boolean, default: false },
    calleeConsent: { type: Boolean, default: false }
  },
  transcript: { type: String },
  qualityRating: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

videoCallSchema.index({ callerId: 1 });
videoCallSchema.index({ calleeId: 1 });
videoCallSchema.index({ status: 1 });
videoCallSchema.index({ createdAt: -1 });

export default mongoose.model('VideoCall', videoCallSchema);
