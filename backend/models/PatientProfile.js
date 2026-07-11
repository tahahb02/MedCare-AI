import mongoose from 'mongoose';

const patientProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  medicalRecordNumber: { type: String, unique: true },
  dateOfBirth: Date,
  gender: { type: String, enum: ['homme', 'femme', 'autre'] },
  bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  address: String,
  city: String,
  zipCode: String,
  emergencyContact: { name: String, phone: String, relationship: String },
  insuranceProvider: String,
  insuranceNumber: String,
  insuranceExpiryDate: Date,
  primaryDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  allergies: [{ name: String, severity: { type: String, enum: ['légère', 'modérée', 'grave'] }, reaction: String, identifiedDate: Date }],
  chronicConditions: [{ name: String, diagnosedDate: Date, status: { type: String, enum: ['actif', 'en_rémission', 'contrôlé'] }, treatment: String }],
  familyHistory: [{ condition: String, relation: String, ageAtDiagnosis: Number }],
  surgicalHistory: [{ procedure: String, date: Date, hospital: String, surgeon: String, notes: String, complications: String }],
  height: Number,
  weight: Number,
  BMI: Number,
  smokingStatus: { type: String, enum: ['non', 'fumer', 'ancien'] },
  smokingYears: Number,
  alcoholConsumption: { type: String, enum: ['aucun', 'occasionnel', 'régulier', 'important'] },
  physicalActivityLevel: { type: String, enum: ['sédentaire', 'léger', 'modéré', 'intense'] },
  activityFrequency: Number,
  bloodPressureHistory: [{ systolic: Number, diastolic: Number, date: Date, measuredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
  weightHistory: [{ weight: Number, date: Date, notes: String }],
  bloodSugarHistory: [{ value: Number, date: Date, fasting: Boolean, measuredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
  cholesterolHistory: [{ total: Number, hdl: Number, ldl: Number, triglycerides: Number, date: Date }],
  heartRateHistory: [{ value: Number, date: Date, context: String }],
  lastCheckup: { date: Date, doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, notes: String, nextCheckupDate: Date },
  medicalNotes: String,
  doctorNotes: String,
  consents: {
    dataProcessing: { type: Boolean, default: false },
    dataProcessingDate: Date,
    marketingConsent: { type: Boolean, default: false },
    marketingConsentDate: Date,
    dataRetentionConsent: { type: Boolean, default: false },
    dataRetentionConsentDate: Date,
    thirdPartySharing: { type: Boolean, default: false },
    thirdPartySharingDate: Date
  },
  dataExportRequested: { type: Boolean, default: false },
  dataExportDate: Date,
  accountDeletionRequested: { type: Boolean, default: false },
  accountDeletionDate: Date
}, { timestamps: true });

patientProfileSchema.index({ userId: 1 });
patientProfileSchema.index({ primaryDoctorId: 1 });
patientProfileSchema.index({ medicalRecordNumber: 1 });

patientProfileSchema.pre('save', async function() {
  if (!this.medicalRecordNumber) {
    const count = await mongoose.model('PatientProfile').countDocuments();
    this.medicalRecordNumber = `MED-${String(count + 1).padStart(4, '0')}-${String(Math.floor(1000 + Math.random() * 9000))}`;
  }
  if (this.height && this.weight) {
    this.BMI = Math.round((this.weight / ((this.height / 100) ** 2)) * 10) / 10;
  }
});

export default mongoose.model('PatientProfile', patientProfileSchema);
