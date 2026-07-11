import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  endDate: Date,
  duration: { type: Number, default: 30 },
  type: { type: String, enum: ['consultation', 'urgence', 'suivi', 'téléconsultation', 'bilan', 'control'], default: 'consultation' },
  urgencyDegree: { type: String, enum: ['routine', 'normal', 'urgent', 'très_urgent', 'critique'], default: 'normal' },
  status: { type: String, enum: ['en_attente', 'confirmé', 'en_cours', 'terminé', 'annulé', 'absent', 'reporté', 'en_salle_attente'], default: 'en_attente' },
  reason: String,
  symptoms: [String],
  patientNotes: String,
  doctorNotes: String,
  location: { type: String, enum: ['cabinet', 'hôpital', 'domicile', 'en_ligne'], default: 'cabinet' },
  followUp: { type: Boolean, default: false },
  followUpAppointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  documentsUploaded: [String],
  consultationFee: Number,
  paid: { type: Boolean, default: false },
  paymentMethod: String,
  cancelReason: String,
  cancelBy: { type: String, enum: ['patient', 'medecin'] },
  aiUrgencyScore: { type: Number, min: 0, max: 100 },
  reminderSent: { type: Boolean, default: false },
  waitingRoom: {
    joinedAt: Date,
    position: Number,
    estimatedWaitTime: Number,
    status: { type: String, enum: ['waiting', 'notified', 'in_consultation'] },
    notifiedAt: Date
  },
  preConsultation: {
    completed: { type: Boolean, default: false },
    questionnaire: [{ question: String, answer: String }],
    documentsUploaded: [String],
    submittedAt: Date
  },
  postConsultation: {
    summary: String,
    aiTranscript: String,
    followUpSuggested: { type: Boolean, default: false },
    suggestedFollowUpDate: Date,
    prescriptionGenerated: { type: Boolean, default: false }
  }
}, { timestamps: true });

appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ status: 1 });

export default mongoose.model('Appointment', appointmentSchema);
