import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalDocument' },
  medications: [{
    name: { type: String, required: true },
    genericName: String,
    dosage: String,
    unit: String,
    frequency: String,
    times: [String],
    duration: Number,
    startDate: Date,
    endDate: Date,
    instructions: String,
    withFood: { type: Boolean, default: false },
    beforeOrAfterMeal: { type: String, enum: ['avant', 'après', 'indifférent'], default: 'indifférent' },
    refillCount: { type: Number, default: 0 },
    remainingRefills: { type: Number, default: 0 },
    sideEffects: [String],
    interactions: [String],
    therapeuticClass: String,
    route: { type: String, enum: ['oral', 'topique', 'injectable', 'inhalation'], default: 'oral' },
    contraindications: [String],
    refillReminderAt: Date
  }],
  diagnosis: String,
  diagnosisCode: String,
  notes: String,
  validUntil: Date,
  status: { type: String, enum: ['active', 'terminée', 'annulée'], default: 'active' },
  pharmacy: { name: String, address: String, phone: String },
  pdfUrl: String,
  signedAt: Date,
  signedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sentToPatient: { type: Boolean, default: false },
  sentToPharmacy: { type: Boolean, default: false }
}, { timestamps: true });

prescriptionSchema.index({ patientId: 1, status: 1 });
prescriptionSchema.index({ doctorId: 1 });

export default mongoose.model('Prescription', prescriptionSchema);
