const express = require('express');
const router = express.Router();

const {
  registerCollegeUser,
  verifyCollegeUser,
  sendGuestOtp,
  verifyGuestOtp,
} = require('../controllers/registerController.js');

// College routes
router.post('/college', registerCollegeUser);
router.post('/college/verify', verifyCollegeUser);

// Guest routes
router.post('/guest/send-otp', sendGuestOtp);
router.post('/guest/verify-otp', verifyGuestOtp);

module.exports = router;
