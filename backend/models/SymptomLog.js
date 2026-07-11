import mongoose from 'mongoose';

const symptomLogSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  quickLog: { mood: { type: Number, min: 1, max: 5 }, painLevel: { type: Number, min: 0, max: 10 }, energyLevel: { type: Number, min: 1, max: 5 } },
  symptoms: [{ name: String, severity: { type: Number, min: 1, max: 10 }, duration: String, location: String, triggers: String, bodyPart: String }],
  mood: { type: Number, min: 1, max: 5 },
  sleepHours: Number,
  sleepQuality: { type: Number, min: 1, max: 5 },
  exerciseMinutes: Number,
  exerciseType: String,
  waterIntake: Number,
  meals: Number,
  painLevel: { type: Number, min: 0, max: 10 },
  energyLevel: { type: Number, min: 1, max: 5 },
  stressLevel: { type: Number, min: 1, max: 5 },
  weight: Number,
  notes: String,
  photoUrl: String,
  audioNotes: String,
  aiAnalysis: String,
  aiSeverityScore: { type: Number, min: 0, max: 100 },
  sharedWithDoctor: { type: Boolean, default: false },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctorNotes: String
}, { timestamps: true });

symptomLogSchema.index({ patientId: 1, date: -1 });

export default mongoose.model('SymptomLog', symptomLogSchema);
