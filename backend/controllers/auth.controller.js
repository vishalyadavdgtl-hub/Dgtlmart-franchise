const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const ReferralPartner = require('../models/ReferralPartner');
const FranchiseBuyer = require('../models/FranchiseBuyer');
const { sendPasswordResetEmail } = require('../utils/emailService');

// Unified Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Search in all models
    let user = await Admin.findOne({ email });
    let role = 'admin';
    
    if (!user) {
      user = await ReferralPartner.findOne({ email });
      if (user) role = user.partnerType; 
    }

    if (!user) {
      return res.status(404).json({ error: 'User with this email does not exist' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();
    
    // Use v4 SDK method
    await sendPasswordResetEmail(user.email, resetToken, role);

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Unified forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Unified Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Search for token in all models
    let user = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    let role = 'admin';

    if (!user) {
      user = await ReferralPartner.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });
      if (user) role = user.partnerType;
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password reset successfully', role });
  } catch (error) {
    console.error('Unified reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
