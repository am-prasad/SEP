import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import CollegeUser from '../models/CollegeUser.js';
import GuestUser from '../models/GuestUser.js';

// ✅ Proper Twilio import and initialization
import twilio from 'twilio';

// Fixed: Use correct environment variable names
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID, 
  process.env.TWILIO_AUTH_TOKEN
);

// 🔐 OTP generator
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 📱 Format and validate phone number
function formatPhoneNumber(mobile) {
  // If it already starts with +, return as is
  if (mobile.startsWith('+')) {
    return mobile;
  }
  
  // Remove any spaces, dashes, or special characters
  const cleaned = mobile.replace(/\D/g, '');
  
  // If it already starts with country code, return as is
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  
  // If it's 10 digits, add +91 (India)
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  
  // Default to +91 for Indian numbers
  return `+91${cleaned}`;
}

// 📱 Extract clean mobile number (without country code)
function getCleanMobileNumber(mobile) {
  // If it starts with +91, remove it
  if (mobile.startsWith('+91')) {
    return mobile.substring(3);
  }
  
  // If it starts with 91 (12 digits total), remove first 2 digits
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned.substring(2);
  }
  
  // Otherwise return cleaned number
  return cleaned;
}

// 📱 Validate Indian mobile number
function isValidIndianMobile(mobile) {
  const cleanNumber = getCleanMobileNumber(mobile);
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(cleanNumber);
}

// 🎓 College Registration
export async function registerCollegeUser(req, res) {
  const { srNo, name, email, mobile, department, password } = req.body;

  // Validation
  if (!srNo || !name || !email || !mobile || !department || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'All fields are required.' 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false,
      message: 'Please enter a valid email address.' 
    });
  }

  // Mobile validation
  if (!isValidIndianMobile(mobile)) {
    return res.status(400).json({ 
      success: false,
      message: 'Please enter a valid Indian mobile number.' 
    });
  }

  // Password validation
  if (password.length < 6) {
    return res.status(400).json({ 
      success: false,
      message: 'Password must be at least 6 characters long.' 
    });
  }

  try {
    // Check for existing user
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

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const cleanMobileNumber = getCleanMobileNumber(mobile);
    const newUser = new CollegeUser({
      srNo,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: cleanMobileNumber, // Store only 10 digits
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
        department: newUser.department
      }
    });
  } catch (err) {
    console.error('Register Error:', err);
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ 
        success: false,
        message: `${field} already exists. Please use a different one.` 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Registration failed. Please try again later.' 
    });
  }
}

// 📲 Send Guest OTP
export async function sendGuestOtp(req, res) {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ 
      success: false,
      message: 'Mobile number is required.' 
    });
  }

  // Mobile validation
  if (!isValidIndianMobile(mobile)) {
    return res.status(400).json({ 
      success: false,
      message: 'Please enter a valid Indian mobile number.' 
    });
  }

  const cleanMobile = getCleanMobileNumber(mobile);

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    // Find or create guest user
    let guest = await GuestUser.findOne({ mobile: cleanMobile });

    if (!guest) {
      guest = new GuestUser({ 
        mobile: cleanMobile, 
        otp, 
        otpExpiresAt,
        verified: false
      });
    } else {
      guest.otp = otp;
      guest.otpExpiresAt = otpExpiresAt;
      guest.verified = false;
    }

    await guest.save();

    // Format phone number for Twilio
    const formattedMobile = formatPhoneNumber(cleanMobile);

    // Send OTP via Twilio
    const messageOptions = {
      body: `Your OTP for Lost & Found app is: ${otp}. Valid for 10 minutes. Do not share this OTP.`,
      to: formattedMobile,
    };

    // Use either Messaging Service SID or From number
    if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
      messageOptions.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    } else if (process.env.TWILIO_PHONE_NUMBER) {
      messageOptions.from = process.env.TWILIO_PHONE_NUMBER;
    } else {
      throw new Error('Either TWILIO_MESSAGING_SERVICE_SID or TWILIO_PHONE_NUMBER must be configured');
    }

    const message = await twilioClient.messages.create(messageOptions);

    console.log(`OTP sent successfully to ${formattedMobile}. Message SID: ${message.sid}`);

    res.status(200).json({ 
      success: true,
      message: 'OTP sent successfully to your mobile number.',
      otpSent: true,
      expiresIn: '10 minutes'
    });

  } catch (err) {
    console.error('Twilio OTP Send Error:', err);

    // Handle specific Twilio errors
    let errorMessage = 'Failed to send OTP. Please try again later.';
    
    if (err.code === 21603) {
      errorMessage = 'SMS service configuration error. Please contact support.';
    } else if (err.code === 21614) {
      errorMessage = 'Invalid mobile number. Please check and try again.';
    } else if (err.code === 21608) {
      errorMessage = 'Mobile number is not reachable. Please try again.';
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

// ✅ Verify Guest OTP
export async function verifyGuestOtp(req, res) {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number and OTP are required.',
    });
  }

  // Clean mobile number
  const cleanMobile = getCleanMobileNumber(mobile);

  // OTP validation
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

    if (!guest.otp) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new OTP.',
      });
    }

    if (guest.otpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    if (guest.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.',
      });
    }

    // OTP is valid - mark as verified
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
        verifiedAt: guest.verifiedAt
      }
    });

  } catch (err) {
    console.error('OTP Verification Error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Verification failed. Please try again later.' 
    });
  }
}

// 🔄 Resend OTP function
export async function resendGuestOtp(req, res) {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ 
      success: false,
      message: 'Mobile number is required.' 
    });
  }

  const cleanMobile = getCleanMobileNumber(mobile);

  try {
    const guest = await GuestUser.findOne({ mobile: cleanMobile });

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Mobile number not found. Please register first.',
      });
    }

    if (guest.verified) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is already verified.',
      });
    }

    // Check if last OTP was sent recently (prevent spam)
    const now = new Date();
    const lastOtpTime = guest.updatedAt || guest.createdAt;
    const timeDiff = (now - lastOtpTime) / 1000; // in seconds

    if (timeDiff < 60) { // 1 minute cooldown
      return res.status(429).json({
        success: false,
        message: `Please wait ${60 - Math.floor(timeDiff)} seconds before requesting a new OTP.`,
      });
    }

    // Generate new OTP
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    guest.otp = otp;
    guest.otpExpiresAt = otpExpiresAt;
    await guest.save();

    // Send OTP
    const formattedMobile = formatPhoneNumber(cleanMobile);
    const messageOptions = {
      body: `Your new OTP for Lost & Found app is: ${otp}. Valid for 10 minutes.`,
      to: formattedMobile,
    };

    if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
      messageOptions.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    } else {
      messageOptions.from = process.env.TWILIO_PHONE_NUMBER;
    }

    await twilioClient.messages.create(messageOptions);

    res.status(200).json({ 
      success: true,
      message: 'New OTP sent successfully.',
    });

  } catch (err) {
    console.error('Resend OTP Error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to resend OTP. Please try again later.' 
    });
  }
}