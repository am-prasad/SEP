import mongoose from 'mongoose';

const collegeUserSchema = new mongoose.Schema({
  srNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  passwordHash: { type: String, required: true }, // Store hashed password
}, { timestamps: true });

export default mongoose.model('CollegeUser', collegeUserSchema);
