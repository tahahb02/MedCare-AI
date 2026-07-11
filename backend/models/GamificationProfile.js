import mongoose from 'mongoose';

const gamificationProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ badgeId: String, earnedAt: Date, name: String, description: String, icon: String }],
  streak: { currentDays: { type: Number, default: 0 }, longestDays: { type: Number, default: 0 }, lastLogDate: Date },
  challenges: [{ challengeId: String, name: String, description: String, target: Number, current: { type: Number, default: 0 }, reward: Number, startDate: Date, endDate: Date, completed: { type: Boolean, default: false } }],
  pointsHistory: [{ action: String, points: Number, date: Date, description: String }]
}, { timestamps: true });

export default mongoose.model('GamificationProfile', gamificationProfileSchema);
