import mongoose from 'mongoose';

const guestUserSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  otp: { type: String }, // store OTP for verification
  otpExpiresAt: { type: Date }, // OTP expiry time
  verified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('GuestUser', guestUserSchema);
