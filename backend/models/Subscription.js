import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  planType: { type: String, enum: ['mensuel', 'trimestriel', 'semestre', 'annuel'], required: true },
  status: { type: String, enum: ['actif', 'en_attente', 'expiré', 'suspendu', 'annulé', 'en_période_de_grâce'], default: 'en_attente' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  nextPaymentDate: Date,
  amount: { type: Number, required: true },
  originalAmount: Number,
  discountApplied: { type: Number, default: 0 },
  promoCode: String,
  currency: { type: String, default: 'MAD' },
  paymentMethod: { type: String, enum: ['especes', 'virement', 'cartebancaire', 'mobile', 'online'], default: 'especes' },
  paymentProof: String,
  paymentReceiptUrl: String,
  autoRenewal: { type: Boolean, default: false },
  autoRenewalPaymentMethod: String,
  isTrialPeriod: { type: Boolean, default: false },
  trialEndDate: Date,
  trialConverted: { type: Boolean, default: false },
  gracePeriodDays: { type: Number, default: 7 },
  gracePeriodEnd: Date,
  alerts: {
    j30Sent: { type: Boolean, default: false },
    j15Sent: { type: Boolean, default: false },
    j3Sent: { type: Boolean, default: false },
    j0Sent: { type: Boolean, default: false },
    j7Sent: { type: Boolean, default: false }
  },
  installmentPlan: {
    enabled: { type: Boolean, default: false },
    totalInstallments: Number,
    completedInstallments: { type: Number, default: 0 },
    installmentAmount: Number,
    installmentFrequency: { type: String, enum: ['weekly', 'biweekly', 'monthly'] },
    nextInstallmentDate: Date
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  renewalReminderSent: { type: Boolean, default: false },
  lastReminderDate: Date,
  history: [{ date: Date, action: String, amount: Number, notes: String, performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }]
}, { timestamps: true });

subscriptionSchema.index({ patientId: 1 });
subscriptionSchema.index({ status: 1, endDate: 1 });

export default mongoose.model('Subscription', subscriptionSchema);
