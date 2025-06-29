import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import twilio from 'twilio';
import CollegeUser from '../models/CollegeUser.js';
import GuestUser from '../models/GuestUser.js';

dotenv.config();

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Helper Functions
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function formatPhoneNumber(mobile) {
  if (mobile.startsWith('+')) return mobile;
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return `+91${cleaned}`;
}

function getCleanMobileNumber(mobile) {
  if (mobile.startsWith('+91')) return mobile.substring(3);
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) return cleaned.substring(2);
  return cleaned;
}

function isValidIndianMobile(mobile) {
  const cleanNumber = getCleanMobileNumber(mobile);
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(cleanNumber);
}

// 🎓 College Registration
export async function registerCollegeUser(req, res) {
  const { srNo, name, email, mobile, department, password } = req.body;

  if (!srNo || !name || !email || !mobile || !department || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  if (!isValidIndianMobile(mobile)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid Indian mobile number.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  try {
    const existingUser = await CollegeUser.findOne({
      $or: [{ srNo }, { email }, { mobile }],
    });

    if (existingUser) {
      let conflictField = '';
      if (existingUser.srNo === srNo) conflictField = 'SR Number';
      else if (existingUser.email === email) conflictField = 'Email';
      else if (existingUser.mobile === mobile) conflictField = 'Mobile number';

      return res.status(400).json({
        success: false,
        message: `${conflictField} already exists. Please use a different one.`,
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const cleanMobileNumber = getCleanMobileNumber(mobile);
    const newUser = new CollegeUser({
      srNo,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: cleanMobileNumber,
      department: department.trim(),
      passwordHash,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'College user registered successfully.',
      user: {
        id: newUser._id,
        srNo: newUser.srNo,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        department: newUser.department,
      },
    });
  } catch (err) {
    console.error('Register Error:', err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists. Please use a different one.`,
      });
    }
    res.status(500).json({ success: false, message: 'Registration failed. Please try again later.' });
  }
}

// 🎓 College User Verification
export async function verifyCollegeUser(req, res) {
  const { srNo, password } = req.body;

  if (!srNo || !password) {
    return res.status(400).json({
      verified: false,
      message: 'SR Number and password are required.',
    });
  }

  try {
    const user = await CollegeUser.findOne({ srNo });

    if (!user) {
      return res.status(404).json({
        verified: false,
        message: 'College user not found',
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        verified: false,
        message: 'Incorrect password',
      });
    }

    res.status(200).json({
      verified: true,
      user: {
        id: user._id,
        srNo: user.srNo,
        name: user.name,
        department: user.department,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (err) {
    console.error('College verification error:', err);
    res.status(500).json({
      verified: false,
      message: 'Verification failed due to server error',
    });
  }
}

// 📲 Guest OTP Send
export async function sendGuestOtp(req, res) {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ success: false, message: 'Mobile number is required.' });
  }

  if (!isValidIndianMobile(mobile)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid Indian mobile number.' });
  }

  const cleanMobile = getCleanMobileNumber(mobile);
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  try {
    let guest = await GuestUser.findOne({ mobile: cleanMobile });

    if (!guest) {
      guest = new GuestUser({ mobile: cleanMobile, otp, otpExpiresAt, verified: false });
    } else {
      guest.otp = otp;
      guest.otpExpiresAt = otpExpiresAt;
      guest.verified = false;
    }

    await guest.save();

    const formattedMobile = formatPhoneNumber(cleanMobile);
    const messageOptions = {
      body: `Your OTP for Campofound app is: ${otp}. Valid for 10 minutes.`,
      to: formattedMobile,
    };

    if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
      messageOptions.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    } else {
      messageOptions.from = process.env.TWILIO_PHONE_NUMBER;
    }

    const message = await twilioClient.messages.create(messageOptions);
    console.log(`OTP sent to ${formattedMobile}. SID: ${message.sid}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully.',
      otpSent: true,
      expiresIn: '10 minutes',
    });
  } catch (err) {
    console.error('Twilio OTP Send Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Try again later.',
    });
  }
}

// ✅ Guest OTP Verification
export async function verifyGuestOtp(req, res) {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number and OTP are required.',
    });
  }

  const cleanMobile = getCleanMobileNumber(mobile);

  if (otp.length !== 6 || !/^\d+$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: 'OTP must be a 6-digit number.',
    });
  }

  try {
    const guest = await GuestUser.findOne({ mobile: cleanMobile });

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Mobile number not found. Please request OTP first.',
      });
    }

    if (guest.verified) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is already verified.',
      });
    }

    if (!guest.otp || guest.otpExpiresAt < new Date() || guest.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.',
      });
    }

    guest.verified = true;
    guest.otp = null;
    guest.otpExpiresAt = null;
    guest.verifiedAt = new Date();

    await guest.save();

    res.status(200).json({
      success: true,
      message: 'Mobile number verified successfully.',
      verified: true,
      user: {
        id: guest._id,
        mobile: guest.mobile,
        verified: guest.verified,
        verifiedAt: guest.verifiedAt,
      },
    });
  } catch (err) {
    console.error('OTP Verification Error:', err);
    res.status(500).json({
      success: false,
      message: 'Verification failed. Please try again later.',
    });
  }
}
