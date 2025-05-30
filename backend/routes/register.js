const express = require('express');
const router = express.Router();

const {
  registerCollegeUser,
  sendGuestOtp,
  verifyGuestOtp,
} = require('../controllers/registerController');

router.post('/college', registerCollegeUser);
router.post('/guest/send-otp', sendGuestOtp);
router.post('/guest/verify-otp', verifyGuestOtp);

module.exports = router;
