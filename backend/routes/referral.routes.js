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
router.post('/login-with-otp', loginLimiter, referralController.loginWithOTP);

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

// ✅ Upload Documents for Franchise Application
router.post(
  '/upload-documents',
  (req, res, next) => {
    const multerUpload = upload.fields([
      { name: 'kycDocument', maxCount: 1 },
      { name: 'ndaDocument', maxCount: 1 },
      { name: 'signedAgreement', maxCount: 1 }
    ]);
    
    multerUpload(req, res, function (err) {
      if (err) {
        console.error("Multer Error:", err);
        return res.status(500).json({ error: "Multer Upload Error", details: err.message || err });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const userId = req.body.userId;
      if (!userId) return res.status(400).json({ message: "User ID is required" });
      
      const user = await ReferralPartner.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Update text fields from formData
      const { 
        cityAndState, professionalBackground, marketingExperience, 
        investmentBudget, franchiseStartDate, existingSetup, 
        revenueTarget, consultationReadiness, 
        role, franchiseType, commissionRate 
      } = req.body;
      
      if (cityAndState) user.cityAndState = cityAndState;
      if (professionalBackground) user.professionalBackground = professionalBackground;
      if (marketingExperience) user.marketingExperience = marketingExperience;
      if (investmentBudget) user.investmentBudget = investmentBudget;
      if (franchiseStartDate) user.franchiseStartDate = franchiseStartDate;
      if (existingSetup) user.existingSetup = existingSetup;
      if (revenueTarget) user.revenueTarget = revenueTarget;
      if (consultationReadiness) user.consultationReadiness = consultationReadiness;
      if (role) user.role = role;
      if (franchiseType) user.franchiseType = franchiseType;
      if (commissionRate) user.commissionRate = commissionRate;
      
      if (role === 'dost' || role === 'sathi') {
        user.partnerType = 'franchise';
      }

      // Update documents if uploaded
      if (req.files) {
        if (req.files.kycDocument) user.kycDocumentUrl = req.files.kycDocument[0].location;
        if (req.files.ndaDocument) user.ndaDocumentUrl = req.files.ndaDocument[0].location;
        if (req.files.signedAgreement) user.signedAgreementUrl = req.files.signedAgreement[0].location;
      }

      await user.save();

      res.json({ message: "Application submitted successfully", user });
    } catch (err) {
      console.error("Error submitting application:", err);
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

// ✅ Razorpay - Create Payment Order
router.post('/create-payment-order', async (req, res) => {
  try {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { amount, franchiseType, pkgName, userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // paise mein
      currency: 'INR',
      receipt: `franchise_${userId}_${Date.now()}`,
      notes: {
        partnerId: userId,
        franchiseType: franchiseType || 'referral',
      }
    };

    const order = await razorpay.orders.create(options);

    // Save order id and selected package to DB
    const updateData = {
      razorpayOrderId: order.id,
      paymentAmount: amount,
    };

    if (pkgName) {
      updateData.selectedPackage = {
        packageName: pkgName,
        price: amount,
      };
    }

    await ReferralPartner.findByIdAndUpdate(userId, updateData);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create payment order', details: err.message });
  }
});

// ✅ Razorpay - Verify Payment & Activate Franchise
router.post('/verify-payment', async (req, res) => {
  try {
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Signature verify karo
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
    }

    // Payment verified - update DB
    const updatedPartner = await ReferralPartner.findByIdAndUpdate(
      userId,
      {
        paymentStatus: 'paid',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'PENDING', // Require Admin Approval
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Payment verified successfully! Pending admin approval.',
      partner: {
        id: updatedPartner._id,
        fullName: updatedPartner.fullName,
        status: updatedPartner.status,
        franchiseType: updatedPartner.franchiseType,
        paymentStatus: updatedPartner.paymentStatus,
      }
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ error: 'Payment verification failed', details: err.message });
  }
});

// ⚠️ ALWAYS LAST
router.get('/:code', referralController.validateCode);

module.exports = router;