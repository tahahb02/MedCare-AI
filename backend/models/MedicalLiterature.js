import mongoose from 'mongoose';

const medicalLiteratureSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  query: { type: String, required: true },
  results: [{
    title: { type: String },
    authors: { type: String },
    journal: { type: String },
    year: { type: Number },
    abstract: { type: String },
    url: { type: String },
    pmid: { type: String }
  }],
  saved: { type: Boolean, default: false },
  tags: [{ type: String }]
}, { timestamps: true });

medicalLiteratureSchema.index({ doctorId: 1 });
medicalLiteratureSchema.index({ saved: 1 });

export default mongoose.model('MedicalLiterature', medicalLiteratureSchema);
