import bcrypt from 'bcryptjs';
import CollegeUser from '../models/CollegeUser.js';
import GuestUser from '../models/GuestUser.js';

// Helper function to generate OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const registerCollegeUser = async (req, res) => {
  const { srNo, name, email, mobile, department, password } = req.body;

  if (!srNo || !name || !email || !mobile || !department || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if user already exists with srNo, email, or mobile
    const existingUser = await CollegeUser.findOne({
      $or: [{ srNo }, { email }, { mobile }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User with given SR No, Email, or Mobile already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new CollegeUser({
      srNo,
      name,
      email,
      mobile,
      department,
      passwordHash,
    });

    await newUser.save();

    res.json({ message: 'College user registered successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendGuestOtp = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: 'Mobile number is required.' });
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

  try {
    let guest = await GuestUser.findOne({ mobile });
    if (!guest) {
      guest = new GuestUser({ mobile, otp, otpExpiresAt });
    } else {
      guest.otp = otp;
      guest.otpExpiresAt = otpExpiresAt;
      guest.verified = false;
    }
    await guest.save();

    // TODO: integrate SMS API here to send OTP to user’s mobile
    console.log(`OTP for ${mobile} is: ${otp}`); // For development only, remove in prod

    res.json({ message: 'OTP sent successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyGuestOtp = async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ message: 'Mobile number and OTP are required.' });
  }

  try {
    const guest = await GuestUser.findOne({ mobile });

    if (!guest) {
      return res.status(400).json({ message: 'Mobile number not found. Please request OTP first.' });
    }

    if (guest.verified) {
      return res.status(400).json({ message: 'Mobile number already verified.' });
    }

    if (guest.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    if (guest.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    guest.verified = true;
    guest.otp = null;
    guest.otpExpiresAt = null;
    await guest.save();

    res.json({ message: 'Mobile number verified successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
