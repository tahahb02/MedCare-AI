import mongoose from 'mongoose';

const healthScoreLogSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  score: { type: Number, required: true, min: 0, max: 100 },
  components: [{ name: String, weight: Number, score: Number, data: mongoose.Schema.Types.Mixed }],
  period: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  previousScore: Number,
  trend: { type: String, enum: ['en_hausse', 'en_baisse', 'stable'] }
}, { timestamps: true });

healthScoreLogSchema.index({ patientId: 1, date: -1 });

export default mongoose.model('HealthScoreLog', healthScoreLogSchema);
