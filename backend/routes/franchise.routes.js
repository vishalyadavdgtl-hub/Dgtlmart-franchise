const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const approvedMiddleware = require('../middleware/approvedMiddleware');
const franchiseController = require('../controllers/franchise.controller');

// Get all packages
router.get('/packages', authMiddleware, franchiseController.getPackages);

// Unified Registration and Buy (Unauthenticated)
router.post('/register', franchiseController.registerAndBuy);

// Send OTP
router.post('/send-otp', franchiseController.sendOTP);

// Client/Buyer Registration
router.post('/client/register', franchiseController.registerClient);

// Client Login
router.post('/client/login', franchiseController.loginClient);

// Create franchise buyer order (Authenticated)
router.post('/buy-package', authMiddleware, franchiseController.buyPackage);

// Verify Razorpay payment
router.post('/verify-payment', franchiseController.verifyPayment);

// Submit contact inquiry
router.post('/contact', franchiseController.submitContact);

// Forgot Password
router.post('/client/forgot-password', franchiseController.forgotPassword);

// Reset Password
router.post('/client/reset-password/:token', franchiseController.resetPassword);

// Franchise Dashboard (requires auth + approval)
router.get('/dashboard', approvedMiddleware, franchiseController.getFranchiseDashboard);

module.exports = router;
