import mongoose from 'mongoose';

const subscriptionLogSchema = new mongoose.Schema({
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
  action: {
    type: String,
    enum: ['created', 'renewed', 'suspended', 'cancelled', 'expired', 'reminder_sent', 'grace_started', 'trial_started', 'trial_converted'],
    required: true
  },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: { type: String },
  amount: { type: Number },
  currency: { type: String, default: 'MAD' }
}, { timestamps: true });

subscriptionLogSchema.index({ subscriptionId: 1 });
subscriptionLogSchema.index({ action: 1 });
subscriptionLogSchema.index({ performedBy: 1 });
subscriptionLogSchema.index({ createdAt: -1 });

export default mongoose.model('SubscriptionLog', subscriptionLogSchema);
