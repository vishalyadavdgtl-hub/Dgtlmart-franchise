const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Unified Forgot Password
router.post('/forgot-password', authController.forgotPassword);

// Unified Reset Password
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
