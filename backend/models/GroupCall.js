import mongoose from 'mongoose';

const groupCallSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['host', 'moderator', 'participant'], default: 'participant' }
  }],
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['waiting', 'en_cours', 'terminé'], default: 'waiting' },
  startedAt: Date,
  endedAt: Date,
  maxParticipants: { type: Number, default: 10 }
}, { timestamps: true });

groupCallSchema.index({ appointmentId: 1 });
groupCallSchema.index({ initiatedBy: 1 });
groupCallSchema.index({ status: 1 });

export default mongoose.model('GroupCall', groupCallSchema);
