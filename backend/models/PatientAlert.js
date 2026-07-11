import mongoose from 'mongoose';

const patientAlertSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['dégradation_score', 'valeur_critique', 'adhérence_faible', 'sans_consultation', 'message_non_lu', 'interaction_médicamenteuse', 'résultat_analyse'] },
  title: { type: String, required: true },
  message: String,
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
  metricName: String,
  previousValue: mongoose.Schema.Types.Mixed,
  currentValue: mongoose.Schema.Types.Mixed,
  resolved: { type: Boolean, default: false },
  resolvedAt: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

patientAlertSchema.index({ patientId: 1, resolved: 1 });

export default mongoose.model('PatientAlert', patientAlertSchema);
