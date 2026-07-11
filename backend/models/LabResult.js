import mongoose from 'mongoose';

const labResultSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalDocument', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  testName: { type: String, required: true },
  date: { type: Date, required: true },
  parameters: [{
    name: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    unit: { type: String },
    normalRange: {
      min: { type: Number },
      max: { type: Number }
    },
    status: { type: String, enum: ['normal', 'élevé', 'bas', 'critique'] },
    deviation: { type: Number },
    trend: { type: String, enum: ['stable', 'hausse', 'baisse'] },
    previousValue: { type: mongoose.Schema.Types.Mixed }
  }],
  overallStatus: { type: String, enum: ['normal', 'anormal', 'critique'], default: 'normal' },
  comparisonWithPrevious: { type: String },
  aiInterpretation: { type: String },
  doctorInterpretation: { type: String }
}, { timestamps: true });

labResultSchema.index({ patientId: 1 });
labResultSchema.index({ documentId: 1 });
labResultSchema.index({ doctorId: 1 });
labResultSchema.index({ date: -1 });

export default mongoose.model('LabResult', labResultSchema);
