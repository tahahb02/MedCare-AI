import mongoose from 'mongoose';

const adminProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  employeeId: { type: String, unique: true },
  position: { type: String, enum: ['super_admin', 'admin', 'secretaire'], default: 'secretaire' },
  department: String,
  managedDoctors: [{ doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, assignedDate: Date }],
  permissions: {
    patientManagement: { type: Boolean, default: true },
    subscriptionManagement: { type: Boolean, default: true },
    doctorManagement: { type: Boolean, default: false },
    billingAccess: { type: Boolean, default: true },
    analyticsAccess: { type: Boolean, default: true },
    notificationSend: { type: Boolean, default: true },
    systemSettings: { type: Boolean, default: false },
    auditLogAccess: { type: Boolean, default: false },
    newsletterManagement: { type: Boolean, default: true }
  },
  managedClinics: [{ clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }, role: { type: String, enum: ['owner', 'admin', 'editor'], default: 'editor' } }]
}, { timestamps: true });

adminProfileSchema.pre('save', async function() {
  if (!this.employeeId) {
    const count = await mongoose.model('AdminProfile').countDocuments();
    this.employeeId = `EMP-${String(count + 1).padStart(4, '0')}`;
  }
});

export default mongoose.model('AdminProfile', adminProfileSchema);
