import mongoose from 'mongoose';

const clinicalDecisionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['score_risque', 'interaction_médicamenteuse', 'diagnostic_différentiel', 'recommandation_guideline'] },
  input: { symptoms: [String], analyses: [String], antécédents: [String], médicaments: [String] },
  result: {
    riskScore: Number,
    riskLevel: { type: String, enum: ['faible', 'moyen', 'élevé', 'critique'] },
    recommendations: [{ title: String, description: String, priority: String, source: String }],
    differentialDiagnoses: [{ diagnosis: String, probability: Number, reasoning: String, icd10Code: String }],
    drugInteractions: [{ drug1: String, drug2: String, severity: String, description: String, recommendation: String }],
    guidelines: [{ title: String, source: String, url: String, recommendation: String }]
  },
  provider: { type: String, enum: ['openai', 'gemini', 'mistral'], default: 'openai' },
  confidence: { type: Number, min: 0, max: 100 },
  reviewedByDoctor: { type: Boolean, default: false },
  doctorNotes: String
}, { timestamps: true });

clinicalDecisionSchema.index({ patientId: 1, doctorId: 1 });

export default mongoose.model('ClinicalDecision', clinicalDecisionSchema);
