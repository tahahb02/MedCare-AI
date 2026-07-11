import mongoose from 'mongoose';

const doctorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specializations: [{ name: String, yearsExperience: Number, isPrimary: { type: Boolean, default: false } }],
  licenseNumber: { type: String, unique: true },
  hospital: String,
  clinicAddress: String,
  clinicCoordinates: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], default: [0, 0] } },
  consultationFee: Number,
  currency: { type: String, default: 'MAD' },
  consultationTypes: [{ name: String, duration: Number, price: Number, description: String }],
  acceptsInsurance: { type: Boolean, default: false },
  acceptedInsuranceProviders: [String],
  availableSlots: [{ day: { type: Number, min: 0, max: 6 }, startTime: String, endTime: String, isActive: { type: Boolean, default: true }, maxPatients: { type: Number, default: 1 } }],
  workingHours: { monday: { start: String, end: String }, tuesday: { start: String, end: String }, wednesday: { start: String, end: String }, thursday: { start: String, end: String }, friday: { start: String, end: String }, saturday: { start: String, end: String }, sunday: { start: String, end: String } },
  breakHours: [{ start: String, end: String, reason: String }],
  leaveDays: [{ startDate: Date, reason: String, status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' } }],
  slotDuration: { type: Number, enum: [15, 30, 45, 60], default: 30 },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  ratingsCount: { type: Number, default: 0 },
  totalConsultations: { type: Number, default: 0 },
  totalPatients: { type: Number, default: 0 },
  averageConsultationDuration: { type: Number, default: 30 },
  noShowRate: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  verificationDate: Date,
  verificationDocuments: [{ type: String, url: String, uploadedAt: Date }],
  languages: [String],
  bio: String,
  photo: String,
  education: [{ degree: String, institution: String, year: Number }],
  certifications: [{ name: String, issuingBody: String, year: Number, expiryDate: Date }],
  currentStatus: { type: String, enum: ['disponible', 'en_consultation', 'en_réunion', 'absent', 'indisponible'], default: 'disponible' },
  statusUpdatedAt: Date,
  estimatedAvailableAt: Date,
  statusMessage: String
}, { timestamps: true });

doctorProfileSchema.index({ userId: 1 });
doctorProfileSchema.index({ licenseNumber: 1 });
doctorProfileSchema.index({ 'clinicCoordinates': '2dsphere' });
doctorProfileSchema.index({ 'specializations.name': 1 });

export default mongoose.model('DoctorProfile', doctorProfileSchema);
