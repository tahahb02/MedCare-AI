import mongoose from 'mongoose';

const medicationReminderSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  name: { type: String, required: true },
  dosage: String,
  frequency: String,
  times: [String],
  startDate: Date,
  endDate: Date,
  remainingQuantity: Number,
  refillReminderAt: Date,
  notifications: { type: Boolean, default: true },
  active: { type: Boolean, default: true },
  adherenceLog: [{ date: Date, taken: Boolean, time: String, notes: String }]
}, { timestamps: true });

medicationReminderSchema.index({ patientId: 1, active: 1 });

export default mongoose.model('MedicationReminder', medicationReminderSchema);
