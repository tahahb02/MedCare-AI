import mongoose from 'mongoose';

const medicalDocumentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  originalName: String,
  type: { type: String, enum: ['analyse_sanguine', 'imagerie', 'prescription', 'radio', 'échographie', 'compte_rendu', 'ordonnance', 'autre'], default: 'autre' },
  category: { type: String, enum: ['laboratoire', 'imagerie', 'orientation', 'autre'], default: 'autre' },
  fileUrl: String,
  cloudinaryId: String,
  thumbnailUrl: String,
  fileSize: Number,
  mimeType: String,
  uploadDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['uploaded', 'ai_reviewed', 'doctor_reviewed', 'archived'], default: 'uploaded' },
  aiAnalysis: {
    summary: String,
    keyFindings: [{ parameter: String, value: String, status: { type: String, enum: ['normal', 'attention', 'critique'] }, explanation: String, referenceRange: String }],
    overallAssessment: String,
    recommendedActions: [{ action: String, priority: { type: String, enum: ['basse', 'moyenne', 'haute', 'critique'] }, description: String }],
    urgencyLevel: { type: String, enum: ['routine', 'attention', 'surveillance', 'urgent'] },
    confidence: Number,
    generatedAt: Date,
    provider: String,
    cost: Number
  },
  doctorAnalysis: {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    summary: String,
    findings: [{ parameter: String, doctorOpinion: String, clinicalSignificance: String }],
    diagnosis: String,
    diagnosisCode: String,
    treatmentPlan: String,
    prescriptions: [String],
    followUpNeeded: { type: Boolean, default: false },
    followUpType: String,
    followUpDelay: String,
    differentialDiagnoses: [{ diagnosis: String, probability: Number, reasoning: String }],
    notes: String,
    reviewedAt: Date,
    signed: { type: Boolean, default: false },
    signedAt: Date,
    pdfReportUrl: String
  },
  patientFeedback: {
    understood: { type: Boolean, default: false },
    questions: [String],
    rating: { type: Number, min: 1, max: 5 },
    feedbackDate: Date
  }
}, { timestamps: true });

medicalDocumentSchema.index({ patientId: 1, status: 1 });
medicalDocumentSchema.index({ doctorId: 1 });

export default mongoose.model('MedicalDocument', medicalDocumentSchema);
