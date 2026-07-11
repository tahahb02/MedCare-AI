import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'MAD' },
  paymentMethod: { type: String, enum: ['especes', 'virement', 'cartebancaire', 'mobile', 'online'] },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  receiptNumber: { type: String, unique: true },
  receiptUrl: String,
  refundAmount: Number,
  refundReason: String,
  refundDate: Date,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transactionId: String,
  notes: String
}, { timestamps: true });

paymentSchema.index({ patientId: 1, createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);
