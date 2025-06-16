import mongoose from 'mongoose';

const guestUserSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  otp: { type: String },              // OTP for verification
  otpExpiresAt: { type: Date },       // OTP expiry timestamp
  verified: { type: Boolean, default: false },  // Whether mobile is verified
}, { timestamps: true });

export default mongoose.model('GuestUser', guestUserSchema);
