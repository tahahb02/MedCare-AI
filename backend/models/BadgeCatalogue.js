import mongoose from 'mongoose';

const badgeCatalogueSchema = new mongoose.Schema({
  badgeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String },
  category: { type: String, enum: ['santé', 'engagement', 'rendez-vous', 'communauté'], required: true },
  requirement: {
    type: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  points: { type: Number, default: 0 }
}, { timestamps: true });

badgeCatalogueSchema.index({ badgeId: 1 });
badgeCatalogueSchema.index({ category: 1 });

export default mongoose.model('BadgeCatalogue', badgeCatalogueSchema);
