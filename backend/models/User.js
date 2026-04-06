import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  otp: String,
  otpExpiry: Date,
  isPremium: {
    type: Boolean,
    default: false
  },
  subscriptionType: {
    type: String,
    enum: ['free', 'medium', 'premium'],
    default: 'free'
  },
  subscriptionExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

// Encrypt password using bcrypt
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Check if user entered password matches hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash OTP
userSchema.methods.getOTP = function() {
  // Generate a random 6 digit number
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the OTP before saving to database
  this.otp = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  // Set expiration to 5 mins
  this.otpExpiry = Date.now() + 5 * 60 * 1000;

  return otp;
};

export default mongoose.model('User', userSchema);
