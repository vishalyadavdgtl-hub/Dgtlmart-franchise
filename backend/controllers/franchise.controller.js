const Razorpay = require('razorpay');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const FranchiseBuyer = require('../models/FranchiseBuyer');
const ReferralPartner = require('../models/ReferralPartner');
const Contact = require('../models/Contact');
const { sendPasswordResetEmail, sendOTPEmail, sendContactNotificationEmail } = require('../utils/emailService');
const { generateReferralCode } = require('../utils/codeGenerator');
const OTPVerification = require('../models/OTPVerification');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Deprecated: Frontend now uses explorePackage API
exports.getPackages = (req, res) => {
  res.json({});
};

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

// Client/Buyer Registration
exports.registerClient = async (req, res) => {
  try {
    const { fullName, email, password, phone, businessName, address, role, otp } = req.body;

    if (!fullName || !email || !password || !phone || !businessName || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!otp) {
      return res.status(400).json({ error: 'OTP is required' });
    }

    // Check OTP
    const otpRecord = await OTPVerification.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const existingBuyer = await ReferralPartner.findOne({ email });
    if (existingBuyer) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const existingPhone = await ReferralPartner.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ error: 'Phone already registered' });
    }

    // Unified logic: save as ReferralPartner with partnerType: 'franchise'
    const partner = new ReferralPartner({
      fullName,
      email,
      password: password,
      phone,
      businessName,
      address,
      partnerType: 'franchise',
      role: role || 'dost',
      commissionRate: (role || 'dost') === 'sathi' ? 30 : 25,
      status: 'PENDING',
      isApproved: false
    });

    await partner.save();

    await OTPVerification.deleteOne({ email });

    const token = jwt.sign(
      { 
        id: partner._id, 
        email: partner.email, 
        role: partner.role, 
        status: partner.status,
        isApproved: partner.isApproved 
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful. Your account is pending approval.',
      token,
      user: {
        id: partner._id,
        fullName: partner.fullName,
        email: partner.email,
        businessName: partner.businessName,
        status: partner.status,
        isApproved: partner.isApproved
      }
    });
  } catch (error) {
    console.error('Error registering client:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Client Login
exports.loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;

    const buyer = await ReferralPartner.findOne({ email });
    if (!buyer) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, buyer.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
  { 
    id: buyer._id, 
    email: buyer.email, 
    role: buyer.role || buyer.partnerType, // ✅ FIXED
    status: buyer.status 
  },
  process.env.JWT_SECRET || 'your_jwt_secret',
  { expiresIn: '24h' }
);

    res.json({
      message: 'Login successful',
      token,
      status: buyer.status,
      isApproved: buyer.status === 'approved',
  user: {
    id: buyer._id,
    fullName: buyer.fullName,
    email: buyer.email,
    role: buyer.role || 'dost',
    status: buyer.status,
    isApproved: buyer.status === 'ACTIVE'
  }
    });
  } catch (error) {
    console.error('Error logging in client:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create franchise buyer order
exports.buyPackage = async (req, res) => {
  try {
    const {
      selectedPackage,
      couponCode
    } = req.body;

    const buyerId = req.partner?.id || req.user?.id;

    if (!selectedPackage) {
      return res.status(400).json({ error: 'Package Selection is required' });
    }

    let referredBy = null;

    if (couponCode) {
      const partner = await ReferralPartner.findOne({
        referralCode: couponCode,
        status: 'active'
      });

      if (!partner) {
        return res.status(400).json({ error: 'Invalid referral code' });
      }

      referredBy = partner._id;
    }

    const partner = await ReferralPartner.findById(buyerId);
    if (!partner) {
        return res.status(404).json({ error: 'Partner not found'});
    }

    partner.selectedPackage = selectedPackage;
    partner.couponCode = couponCode || null;
    partner.referredBy = referredBy;
    partner.paymentAmount = selectedPackage.price;
    
    await partner.save();

    const options = {
      amount: selectedPackage.price * 100,
      currency: 'INR',
      receipt: `order_${partner._id}`,
      notes: {
        partnerId: partner._id.toString(),
        packageName: selectedPackage.name || selectedPackage.packageName,
        category: selectedPackage.category
      }
    };

    const order = await razorpay.orders.create(options);

    partner.razorpayOrderId = order.id;
    await partner.save();

    res.status(201).json({
      message: 'Order created successfully. Please complete payment.',
      buyerId: partner._id,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      },
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Verify Razorpay payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      buyerId
    } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const partner = await ReferralPartner.findById(buyerId);

    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    partner.razorpayPaymentId = razorpayPaymentId;
    partner.razorpaySignature = razorpaySignature;
    // For franchise, we'll mark payment-status but still require PENDING approval
    // Note: ReferralPartner model doesn't have paymentStatus yet, we could add it or just use status
    await partner.save();

    if (partner.referredBy) {
      const parentPartner = await ReferralPartner.findById(partner.referredBy);
      
      if (parentPartner) {
        const rate = parentPartner.commissionRate || 10;
        const commissionAmount = (partner.paymentAmount || 0) * (rate / 100);

        await ReferralPartner.findByIdAndUpdate(
          partner.referredBy,
          {
            $inc: { 
              referralCount: 1, 
              totalCommission: commissionAmount 
            }
          }
        );
      }
    }

    res.json({
      success: true,
      message: 'Payment verified successfully. Your account is pending approval.',
      buyer: {
        id: partner._id,
        fullName: partner.fullName,
        email: partner.email,
        businessName: partner.businessName,
        selectedPackage: partner.selectedPackage,
        status: partner.status,
        isApproved: partner.isApproved
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Submit contact inquiry
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    if (!name || !email || !phone || !service || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const contact = new Contact({
      name,
      email,
      phone,
      service,
      message
    });

    await contact.save();

    try {
      await sendContactNotificationEmail({
        name,
        email,
        phone,
        service,
        message
      });
    } catch (emailError) {
      console.error('Failed to send contact notification email:', emailError);
      // We don't want to fail the whole request if email fails, so we just log it.
    }

    res.status(201).json({
      message: 'Inquiry submitted successfully',
      contact
    });
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Unified Register and Buy (For new unauthenticated users)
exports.registerAndBuy = async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      phone, 
      businessName, 
      address, 
      selectedPackage, 
      couponCode,
      role,
      otp
    } = req.body;

    if (!fullName || !email || !phone || !selectedPackage) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    if (!otp) {
      return res.status(400).json({ error: 'OTP is required' });
    }

    // Check OTP
    const otpRecord = await OTPVerification.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // 1. Handle User Registration/Update
    let partner = await ReferralPartner.findOne({ email });
    
    if (!partner) {
      const { password } = req.body;
      const initialPassword = password || Math.random().toString(36).slice(-10);
    
      partner = new ReferralPartner({
        fullName,
        email,
        password: initialPassword,
        phone,
        businessName,
        address,
        partnerType: 'franchise',
        role: role || 'dost',
        commissionRate: role === 'sathi' ? 30 : 25,
        status: 'PENDING',
        isApproved: false
      });
    } else {
      partner.fullName = fullName;
      partner.phone = phone;
      partner.businessName = businessName;
      partner.address = address;
    }

    await OTPVerification.deleteOne({ email });

    // 2. Handle Referral/Coupon
    let referredBy = null;
    if (couponCode) {
      const partner = await ReferralPartner.findOne({
        referralCode: couponCode,
        status: 'active'
      });
      if (partner) referredBy = partner._id;
    }

    partner.selectedPackage = selectedPackage;
    partner.couponCode = couponCode || null;
    partner.referredBy = referredBy;
    partner.paymentAmount = selectedPackage.price;


   // ✅ FREE PACKAGE FIX
if (selectedPackage.price === 0) {
  partner.status = 'PENDING';
  partner.isApproved = false;
  await partner.save();

  return res.status(200).json({
    success: true,
    message: "Registered Successfully (Free). Your account is pending approval.",
    buyerId: partner._id,
  });
}


// ✅ FREE PACKAGE FIX
if (selectedPackage.price === 0) {
  buyer.paymentStatus = "paid";
  await buyer.save();

  return res.status(200).json({
    success: true,
    message: "Registered Successfully (Free)",
    buyerId: buyer._id,
  });
}

    // 3. Create Razorpay Order
    const options = {
      amount: selectedPackage.price * 100,
      currency: 'INR',
      receipt: `order_${partner._id}`,
      notes: {
        partnerId: partner._id.toString(),
        packageName: selectedPackage.name || selectedPackage.packageName,
        category: selectedPackage.category
      }
    };

    const order = await razorpay.orders.create(options);
    partner.razorpayOrderId = order.id;

    await partner.save();

    res.status(201).json({
      message: 'Registration successful and order created.',
      buyerId: partner._id,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      },
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Error in registerAndBuy:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};


// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const buyer = await ReferralPartner.findOne({ email });

    if (!buyer) {
      return res.status(404).json({ error: 'Partner with this email does not exist' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    buyer.resetPasswordToken = resetToken;
    buyer.resetPasswordExpires = Date.now() + 3600000;

    await buyer.save();

    await sendPasswordResetEmail(buyer.email, resetToken, 'client');

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
    const buyer = await ReferralPartner.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!buyer) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    buyer.password = await bcrypt.hash(password, salt);
    buyer.resetPasswordToken = undefined;
    buyer.resetPasswordExpires = undefined;

    await buyer.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get Franchise Dashboard (protected + approved)
exports.getFranchiseDashboard = async (req, res) => {
  try {
    const buyerId = req.user?.id;

    const buyer = await ReferralPartner.findById(buyerId)
      .select('-password')
      .populate('referredBy', 'fullName email referralCode');

    if (!buyer) {
      return res.status(404).json({ error: 'Franchise user not found' });
    }

    if (buyer.status !== 'ACTIVE') {
      return res.status(403).json({
        error: 'Your account is under review. Please wait for admin approval.',
        status: buyer.status
      });
    }

    const envUrl = process.env.FRONTEND_URL;
    const frontendUrl =
      envUrl && !envUrl.includes('localhost')
        ? envUrl
        : 'https://partner.dgtlmart.com';

    const referredBuyers = await ReferralPartner.find({ referredBy: buyer._id })
      .select('fullName email phone status createdAt selectedPackage')
      .sort({ createdAt: -1 });

    res.json({
      id: buyer._id,
      fullName: buyer.fullName,
      email: buyer.email,
      phone: buyer.phone,
      address: buyer.address,
      role: 'franchise',
      franchiseType: buyer.role || 'dost',
      status: buyer.status,
      isApproved: true,
      selectedPackage: buyer.selectedPackage,
      paymentStatus: buyer.paymentStatus,
      agreementStatus: buyer.agreementStatus,
      trainingProgress: buyer.trainingProgress,
      joinedDate: buyer.createdAt,
      commissionRate: buyer.role === 'sathi' ? 30 : 25,
      referredBy: buyer.referredBy,
      frontendUrl,
      referralCode: buyer.referralCode,
      referralLink: buyer.referralLink,
      referralCount: buyer.referralCount,
      totalCommission: buyer.totalCommission,
      referredBuyers: referredBuyers.map(b => ({
        fullName: b.fullName,
        email: b.email,
        phone: b.phone,
        status: b.status,
        date: b.createdAt,
        packageName: b.selectedPackage?.packageName
      }))
    });

  } catch (error) {
    console.error('Error fetching franchise dashboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
};




