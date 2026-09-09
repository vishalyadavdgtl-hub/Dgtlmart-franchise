const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const referralController = require('../controllers/referral.controller');
const upload = require("../middleware/upload");
const ReferralPartner = require("../models/ReferralPartner");
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 4, // Limit each IP to 4 requests per hour
  message: { error: 'Too many OTP requests from this IP, please try again after an hour.' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per 15 minutes
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes.' }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 registration requests per hour
  message: { error: 'Too many accounts created from this IP, please try again after an hour.' }
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: { error: 'Too many password reset requests from this IP, please try again after an hour.' }
});

// Register new referral partner
router.post('/register', registerLimiter, referralController.register);

// Send OTP
router.post('/send-otp', otpLimiter, referralController.sendOTP);

// Login referral partner (Email/Password)
router.post('/login', loginLimiter, referralController.login);

// Send Login OTP
router.post('/send-login-otp', otpLimiter, referralController.sendLoginOTP);

// Login with OTP
router.post('/login-with-otp', referralController.loginWithOTP);

// Dashboard
router.get('/dashboard', authMiddleware, referralController.getDashboard);

// Forgot Password
router.post('/forgot-password', forgotPasswordLimiter, referralController.forgotPassword);

// Reset Password
router.post('/reset-password/:token', referralController.resetPassword);

// ✅ Upload Profile Image
router.post(
  "/upload-profile",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const user = await ReferralPartner.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.profileImage = req.file.filename;
      await user.save();

      res.json({
        message: "Image uploaded successfully",
        image: req.file.filename,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

// ✅ Offer Letter
router.get('/offer-letter/:id', authMiddleware, async (req, res) => {
  const user = await ReferralPartner.findById(req.params.id);

  if (!user || !user.offerLetterUrl) {
    return res.status(404).json({ message: "Offer letter not found" });
  }

  res.json({ url: user.offerLetterUrl });
});

// ✅ Certificate
router.get('/certificate/:id', authMiddleware, async (req, res) => {
  const user = await ReferralPartner.findById(req.params.id);

  if (!user || !user.certificateUrl) {
    return res.status(404).json({ message: "Certificate not found" });
  }

  res.json({ url: user.certificateUrl });
});

// Get referral stats
router.get('/stats/:code', referralController.getStats);

// ⚠️ ALWAYS LAST
router.get('/:code', referralController.validateCode);

module.exports = router;