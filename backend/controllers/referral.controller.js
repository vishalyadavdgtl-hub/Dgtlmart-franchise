const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ReferralPartner = require('../models/ReferralPartner');
const FranchiseBuyer = require('../models/FranchiseBuyer');
const { generateReferralCode } = require('../utils/codeGenerator');
const { sendPasswordResetEmail, sendOTPEmail } = require('../utils/emailService');
const OTPVerification = require('../models/OTPVerification');

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone) {
      return res.status(400).json({ error: 'Email and phone are required for OTP' });
    }

    // Check for duplicates
    const existingEmail = await ReferralPartner.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const existingPhone = await ReferralPartner.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ error: 'Phone already registered' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB (upsert so user can resend)
    await OTPVerification.findOneAndUpdate(
      { email },
      { email, otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send email via ZeptoMail
    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// Register new referral partner
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone, address, city, state, pincode, agreementAccepted, partnerType,franchiseType, otp } = req.body;

    // Validation
   if (!fullName || !email || !password || !phone || !address || !agreementAccepted) {
  return res.status(400).json({ error: 'All fields are required' });
}

// Only for franchise
if (partnerType === "franchise" && !franchiseType) {
  return res.status(400).json({ error: 'Franchise type is required for franchise partner' });
}

    if (!agreementAccepted) {
      return res.status(400).json({ error: 'You must accept the agreement to proceed' });
    }

    if (!otp) {
      return res.status(400).json({ error: 'OTP is required' });
    }

    // Check OTP
    const otpRecord = await OTPVerification.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Check if email already exists (double check just in case)
    const existingPartner = await ReferralPartner.findOne({ email });
    if (existingPartner) {
      return res.status(400).json({ error: `Email already registered as a ${existingPartner.partnerType} partner` });
    }

    const existingPhone = await ReferralPartner.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ error: 'Phone already registered' });
    }

    // Determine commission rate
    const type = partnerType === 'franchise' ? 'franchise' : 'referral';
    const commissionRate = type === 'franchise' ? 25 : 10;

    // Create new referral partner
    const referralPartner = new ReferralPartner({
  fullName,
  email,
  password,
  phone,
  address,
  city: city || ' ', 
  state: state || ' ', 
  pincode: pincode || ' ', 
  agreementAccepted,
  agreementAcceptedDate: new Date(),

  partnerType: type,
  franchiseType: type === 'franchise' ? franchiseType : null, // 🔥 FIX

  commissionRate,
  status: 'PENDING',
  isApproved: false
});

    await referralPartner.save();

    // Delete OTP record after successful registration
    await OTPVerification.deleteOne({ email });

    res.status(201).json({
      message: 'Referral partner registered successfully. Your account is pending admin approval.',
      partner: {
        id: referralPartner._id,
        fullName: referralPartner.fullName,
        email: referralPartner.email,
        partnerType: referralPartner.partnerType,
        commissionRate: referralPartner.commissionRate
      }
    });
  } catch (error) {
    console.error('Error registering referral partner:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Login referral partner
exports.login = async (req, res) => {
  try {
    const { email, password, loginRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const partner = await ReferralPartner.findOne({ email });
    if (!partner) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (loginRole && partner.partnerType && loginRole !== partner.partnerType) {
      return res.status(403).json({ error: `This account is registered as a ${partner.partnerType} partner. Please use the ${partner.partnerType} login.` });
    }

    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Allow login for all statuses, let frontend handle the UI redirection based on isApproved
    const token = jwt.sign(
      { 
        id: partner._id, 
        email: partner.email,
        isApproved: partner.isApproved,
        status: partner.status,
        role: partner.role || partner.partnerType || 'referral',
        franchiseType: partner.franchiseType || partner.role || 'referral'
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      partner: {
        id: partner._id,
        fullName: partner.fullName,
        email: partner.email,
        referralCode: partner.referralCode,
        partnerType: partner.partnerType,
        role: partner.role || 'referral',
        commissionRate: partner.commissionRate,
        isApproved: partner.isApproved,
        status: partner.status
      }
    });

  } catch (error) {
    console.error('Error logging in referral partner:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get detailed stats for Dashboard
exports.getDashboard = async (req, res) => {
  try {
    const partner = await ReferralPartner.findById(req.partner.id).select('-password');

    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    const envUrl = process.env.FRONTEND_URL;
    const frontendUrl = (envUrl && !envUrl.includes('localhost')) 
      ? envUrl 
      : 'https://partner.dgtlmart.com';
    const dynamicReferralLink = `${frontendUrl}/buy-franchise?ref=${partner.referralCode}`;

    const referredBuyers = await ReferralPartner.find({ referredBy: partner._id })
      .select('fullName email phone status createdAt selectedPackage')
      .sort({ createdAt: -1 });

    const pendingApprovals = await ReferralPartner.countDocuments({ referredBy: partner._id, status: 'PENDING' });

    res.json({
      fullName: partner.fullName,
      email: partner.email,
      referralCode: partner.referralCode,
      referralLink: dynamicReferralLink,
      referralCount: partner.referralCount,
      totalCommission: partner.totalCommission,
      role: partner.role || partner.partnerType || 'referral',
      franchiseType: partner.franchiseType || partner.role || 'referral',
      commissionRate: partner.commissionRate || 20,
      status: partner.status,
      joinedDate: partner.createdAt,
      territory: partner.territory || null,
      pendingApprovals,
      referredBuyers: referredBuyers.map(buyer => ({
        fullName: buyer.fullName,
        email: buyer.email,
        phone: buyer.phone,
        status: buyer.status,
        date: buyer.createdAt,
        packageName: buyer.selectedPackage?.packageName
      }))
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Validate referral code
exports.validateCode = async (req, res) => {
  try {
    const { code } = req.params;

    const partner = await ReferralPartner.findOne({ 
      referralCode: code,
      status: 'active'
    });

    if (!partner) {
      return res.status(404).json({ error: 'Invalid or inactive referral code' });
    }

    res.json({
      valid: true,
      partner: {
        fullName: partner.fullName,
        referralCode: partner.referralCode
      }
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get referral statistics
exports.getStats = async (req, res) => {
  try {
    const { code } = req.params;

    const partner = await ReferralPartner.findOne({ referralCode: code });

    if (!partner) {
      return res.status(404).json({ error: 'Referral partner not found' });
    }

    res.json({
      fullName: partner.fullName,
      email: partner.email,
      referralCode: partner.referralCode,
      referralCount: partner.referralCount,
      totalCommission: partner.totalCommission,
      status: partner.status,
      registeredDate: partner.createdAt
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const partner = await ReferralPartner.findOne({ email });

    if (!partner) {
      return res.status(404).json({ error: 'User with this email does not exist' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    partner.resetPasswordToken = resetToken;
    partner.resetPasswordExpires = Date.now() + 3600000;

    await partner.save();

    await sendPasswordResetEmail(partner.email, resetToken, partner.partnerType);

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const partner = await ReferralPartner.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!partner) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    partner.password = password; // Model handles hashing
    partner.resetPasswordToken = undefined;
    partner.resetPasswordExpires = undefined;

    await partner.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const user = await ReferralPartner.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      fullName: user.fullName,
      email: user.email,
      status: user.status,
      
      // 🔥 YEH LINE ADD KARO
      profileImage: user.profileImage,

      referralCode: user.referralCode,
      referralCount: user.referralCount,
      totalCommission: user.totalCommission,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
