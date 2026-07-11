import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['patient', 'medecin', 'admin'], required: true },
  avatar: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  verifyMethod: { type: String, enum: ['email', 'whatsapp'], default: 'email' },
  isActive: { type: Boolean, default: true },
  refreshToken: { type: String, select: false },
  lastLogin: Date,
  preferences: {
    language: { type: String, enum: ['fr', 'ar', 'en'], default: 'fr' },
    timezone: { type: String, default: 'Africa/Casablanca' },
    currency: { type: String, default: 'MAD' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notifications: {
      medical: { email: { type: Boolean, default: true }, push: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
      administrative: { email: { type: Boolean, default: true }, push: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
      system: { email: { type: Boolean, default: true }, push: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
      promotional: { email: { type: Boolean, default: false }, push: { type: Boolean, default: false }, inApp: { type: Boolean, default: true } }
    },
    quietHours: { start: { type: String, default: '22:00' }, end: { type: String, default: '07:00' } },
    digestFrequency: { type: String, enum: ['daily', 'weekly', 'none'], default: 'daily' }
  },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, select: false },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  passwordChangedAt: Date,
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: Date,
  deletedAt: Date
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ name: 'text', email: 'text' });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

export default mongoose.model('User', userSchema);
