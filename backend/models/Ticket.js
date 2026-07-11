import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['abonnement', 'technique', 'medical', 'administratif'], required: true },
  priority: { type: String, enum: ['basse', 'moyenne', 'haute', 'urgente'], default: 'moyenne' },
  status: { type: String, enum: ['ouvert', 'en_cours', 'en_attente', 'résolu', 'fermé'], default: 'ouvert' },
  messages: [{
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  resolution: { type: String },
  satisfactionRating: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

ticketSchema.index({ userId: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ category: 1 });

export default mongoose.model('Ticket', ticketSchema);
