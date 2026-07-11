import mongoose from 'mongoose';

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: String,
  email: String,
  logo: String,
  coverImage: String,
  coordinates: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], default: [0, 0] } },
  openingHours: {
    monday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    friday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, isClosed: { type: Boolean, default: true } },
    sunday: { open: String, close: String, isClosed: { type: Boolean, default: true } }
  },
  settings: { defaultCurrency: { type: String, default: 'MAD' }, defaultLanguage: { type: String, default: 'fr' }, timezone: { type: String, default: 'Africa/Casablanca' } },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Clinic', clinicSchema);
