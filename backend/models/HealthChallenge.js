import mongoose from 'mongoose';

const healthChallengeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['pas_quotidiens', 'sommeil', 'hydratation', 'médicaments', 'symptômes'], required: true },
  target: { type: mongoose.Schema.Types.Mixed, required: true },
  duration: { type: Number, required: true },
  reward: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

healthChallengeSchema.index({ type: 1 });
healthChallengeSchema.index({ isActive: 1 });
healthChallengeSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model('HealthChallenge', healthChallengeSchema);
