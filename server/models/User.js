import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Omit password hash by default in database queries
    },
    avatar: {
      type: String,
      default: '',
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    loginAttempts: {
      type: Number,
      required: true,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property to check if account is currently locked due to failed attempts
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Increment failed login attempts and lock account for 15 minutes after 5 failures
userSchema.methods.incLoginAttempts = async function () {
  // If a previous lock has expired, restart counter at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = null;
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  this.loginAttempts = (this.loginAttempts || 0) + 1;
  const updates = { $inc: { loginAttempts: 1 } };

  // Lock for 15 minutes upon reaching 5 failed attempts
  if (this.loginAttempts >= 5 && !this.isLocked) {
    const lockTime = new Date(Date.now() + 15 * 60 * 1000);
    this.lockUntil = lockTime;
    updates.$set = { lockUntil: lockTime };
  }

  return this.updateOne(updates);
};

// Reset login attempts counter after successful authentication
userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = null;
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// Pre-save hook: securely hash password if it was modified (Mongoose 8 compliant async hook without next parameter)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Verify candidate password against hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password || !candidatePassword) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate and hash password reset token (valid for 1 hour)
userSchema.methods.createPasswordResetToken = function () {
  // Generate random 32-byte hex token for user
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Store hashed version in DB to prevent token exposure on DB compromise
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Token expires in 1 hour
  this.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

  return resetToken;
};

// Return safe JSON representation without sensitive fields
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    avatar: this.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.name)}`,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin,
  };
};

export const User = mongoose.model('User', userSchema);
