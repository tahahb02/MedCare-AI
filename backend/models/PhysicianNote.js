import mongoose from 'mongoose';

const physicianNoteSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['consultation', 'observation', 'instruction', 'followUp'], required: true },
  isPrivate: { type: Boolean, default: false },
  tags: [{ type: String }]
}, { timestamps: true });

physicianNoteSchema.index({ patientId: 1 });
physicianNoteSchema.index({ doctorId: 1 });
physicianNoteSchema.index({ appointmentId: 1 });
physicianNoteSchema.index({ category: 1 });

export default mongoose.model('PhysicianNote', physicianNoteSchema);
