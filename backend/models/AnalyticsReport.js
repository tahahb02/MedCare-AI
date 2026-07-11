import mongoose from 'mongoose';

const analyticsReportSchema = new mongoose.Schema({
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  period: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'], required: true },
  date: { type: Date, required: true },
  metrics: {
    totalPatients: { type: Number, default: 0 },
    newPatients: { type: Number, default: 0 },
    activePatients: { type: Number, default: 0 },
    totalDoctors: { type: Number, default: 0 },
    totalAppointments: { type: Number, default: 0 },
    completedAppointments: { type: Number, default: 0 },
    cancelledAppointments: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    revenueByPlan: { type: mongoose.Schema.Types.Mixed, default: {} },
    revenueByDoctor: { type: mongoose.Schema.Types.Mixed, default: {} },
    subscriptionRenewalRate: { type: Number, default: 0 },
    averagePatientLifetime: { type: Number, default: 0 },
    averageWaitTime: { type: Number, default: 0 },
    averageConsultationDuration: { type: Number, default: 0 },
    documentUploads: { type: Number, default: 0 },
    aiAnalysisCount: { type: Number, default: 0 },
    patientSatisfactionScore: { type: Number, default: 0 }
  },
  calculatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

analyticsReportSchema.index({ clinicId: 1 });
analyticsReportSchema.index({ period: 1 });
analyticsReportSchema.index({ date: -1 });
analyticsReportSchema.index({ clinicId: 1, period: 1, date: -1 });

export default mongoose.model('AnalyticsReport', analyticsReportSchema);
