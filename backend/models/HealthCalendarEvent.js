import mongoose from 'mongoose';

const healthCalendarEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['médicament', 'rendez-vous', 'rappel', 'bilan', 'vaccination', 'exercice'], required: true },
  date: { type: Date, required: true },
  endDate: Date,
  reminderBefore: { type: Number, default: 60 },
  recurring: { frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] }, until: Date },
  color: { type: String, default: '#7c3aed' },
  linkedEntityId: String,
  linkedEntityType: String,
  completed: { type: Boolean, default: false }
}, { timestamps: true });

healthCalendarEventSchema.index({ userId: 1, date: 1 });

export default mongoose.model('HealthCalendarEvent', healthCalendarEventSchema);
