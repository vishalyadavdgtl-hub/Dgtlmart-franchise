const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const approvedMiddleware = require('../middleware/approvedMiddleware');
const franchiseController = require('../controllers/franchise.controller');
const adminController = require('../controllers/admin.controller');
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
// Get all packages
router.get('/packages', authMiddleware, franchiseController.getPackages);

// Unified Registration and Buy (Unauthenticated)
router.post('/register', registerLimiter, franchiseController.registerAndBuy);

// Send OTP
router.post('/send-otp', otpLimiter, franchiseController.sendOTP);

// Client/Buyer Registration
router.post('/client/register', registerLimiter, franchiseController.registerClient);

// Client Login (Email/Password)
router.post('/client/login', loginLimiter, franchiseController.loginClient);

// Send Login OTP
router.post('/client/send-login-otp', otpLimiter, franchiseController.sendLoginOTP);

// Client Login with OTP
router.post('/client/login-with-otp', loginLimiter, franchiseController.loginClientWithOTP);

// Create franchise buyer order (Authenticated)
router.post('/buy-package', authMiddleware, franchiseController.buyPackage);

// Verify Razorpay payment
router.post('/verify-payment', franchiseController.verifyPayment);

// Submit contact inquiry
router.post('/contact', franchiseController.submitContact);

// Forgot Password
router.post('/client/forgot-password', forgotPasswordLimiter, franchiseController.forgotPassword);

// Reset Password
router.post('/client/reset-password/:token', franchiseController.resetPassword);

// Franchise Dashboard (requires auth + approval)
router.get('/dashboard', approvedMiddleware, franchiseController.getFranchiseDashboard);

// Get System Settings (Public for dashboard use)
router.get('/settings', adminController.getSettings);

module.exports = router;
