const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const referralController = require('../controllers/referral.controller');
const upload = require("../middleware/upload");
const ReferralPartner = require("../models/ReferralPartner");

// Register new referral partner
router.post('/register', referralController.register);

// Send OTP
router.post('/send-otp', referralController.sendOTP);

// Login referral partner
router.post('/login', referralController.login);

// Dashboard
router.get('/dashboard', authMiddleware, referralController.getDashboard);

// Forgot Password
router.post('/forgot-password', referralController.forgotPassword);

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