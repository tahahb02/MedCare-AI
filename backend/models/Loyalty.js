import mongoose from 'mongoose';

const loyaltySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  points: { type: Number, default: 0, min: 0 },
  history: [{
    type: { type: String, enum: ['earned', 'redeemed', 'expired', 'adjusted'], required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now }
  }],
  rewards: [{ type: mongoose.Schema.Types.Mixed }],
  referralCode: { type: String, unique: true, sparse: true }
}, { timestamps: true });

loyaltySchema.index({ userId: 1 });
loyaltySchema.index({ referralCode: 1 });

export default mongoose.model('Loyalty', loyaltySchema);
