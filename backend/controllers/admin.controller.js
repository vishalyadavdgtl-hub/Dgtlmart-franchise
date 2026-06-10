const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const ReferralPartner = require('../models/ReferralPartner');
const FranchiseBuyer = require('../models/FranchiseBuyer');
const Contact = require('../models/Contact');
const { sendPasswordResetEmail, sendApprovalEmail, sendRejectionEmail } = require('../utils/emailService');
const { generateReferralCode } = require('../utils/codeGenerator');

// Admin login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find admin by username or email
    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get all referral partners (protected)
exports.getReferrals = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', type } = req.query;

    const query = {};

    // ✅ IMPORTANT LINE
    if (type) {
      query.partnerType = type; // referral / franchise
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { referralCode: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    const total = await ReferralPartner.countDocuments(query);

    const referrals = await ReferralPartner.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    res.json({
      referrals,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get all franchise buyers (protected)
exports.getFranchiseBuyers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', paymentStatus = '' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const total = await ReferralPartner.countDocuments(query);
    const buyers = await ReferralPartner.find(query)
      .populate('referredBy', 'fullName email referralCode')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    res.json({
      buyers,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching franchise buyers:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get dashboard statistics (protected)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalReferrals = await ReferralPartner.countDocuments({ partnerType: 'referral' });
    const pendingReferrals = await ReferralPartner.countDocuments({ partnerType: 'referral', status: 'PENDING' });
    const totalBuyers = await ReferralPartner.countDocuments({ partnerType: 'franchise' });
    const pendingBuyers = await ReferralPartner.countDocuments({ partnerType: 'franchise', status: 'PENDING' });
    const paidBuyers = await ReferralPartner.countDocuments({ partnerType: 'franchise', paymentStatus: 'paid' });
    const totalContacts = await Contact.countDocuments();

    // Calculate total revenue
    const paidOrders = await ReferralPartner.find({ partnerType: 'franchise', paymentStatus: 'paid' });
    const totalRevenue = paidOrders.reduce((sum, buyer) => sum + (buyer.paymentAmount || 0), 0);

    // Calculate total commissions
    const allPartners = await ReferralPartner.find();
    const totalCommissions = allPartners.reduce((sum, partner) => sum + (partner.totalCommission || 0), 0);

    // Recent activity (last 5 buyers)
    const recentBuyers = await ReferralPartner.find({ partnerType: 'franchise' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('referredBy', 'fullName referralCode')
      .select('fullName businessName selectedPackage paymentStatus createdAt');

    res.json({
      stats: {
        totalReferrals,
        pendingReferrals,
        totalBuyers,
        pendingBuyers,
        paidBuyers,
        totalRevenue,
        totalCommissions,
        totalContacts
      },
      recentActivity: recentBuyers
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Update buyer status (protected)
exports.updateBuyerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const partnerStatus = status === 'approved' ? 'ACTIVE' : (status === 'rejected' ? 'REJECTED' : 'PENDING');
    
    const buyer = await ReferralPartner.findById(id).populate('referredBy', 'fullName email referralCode');

    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    buyer.status = partnerStatus;
    buyer.notes = notes || '';
    buyer.isApproved = status === 'approved';

    if (partnerStatus === 'ACTIVE' && !buyer.referralCode) {
      let referralCode;
      let isUnique = false;
      while (!isUnique) {
        referralCode = generateReferralCode();
        const existing = await ReferralPartner.findOne({ referralCode });
        if (!existing) isUnique = true;
      }
      const envUrl = process.env.FRONTEND_URL;
      const frontendUrl = (envUrl && !envUrl.includes('localhost')) ? envUrl : 'https://partner.dgtlmart.com';
      buyer.referralCode = referralCode;
      buyer.referralLink = `${frontendUrl}/buy-franchise?ref=${referralCode}`;
    }

    await buyer.save();

    // Send email notification
    try {
      if (status === 'approved') {
        await sendApprovalEmail(buyer.email, buyer.fullName);
      } else if (status === 'rejected') {
        await sendRejectionEmail(buyer.email, buyer.fullName, notes);
      }
    } catch (emailErr) {
      console.error('Email notification error:', emailErr);
    }

    res.json({
      message: 'Buyer status updated successfully',
      buyer
    });
  } catch (error) {
    console.error('Error updating buyer status:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Update referral partner status (protected)
exports.updateReferralStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    status = status.toUpperCase();

    const validStatuses = ['PENDING', 'ACTIVE', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status value: ${status}` });
    }

    const isApproved = status === 'ACTIVE';

    // 🔥 IMPORTANT CHANGE
    const partner = await ReferralPartner.findById(id);

    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // ✅ update status
    partner.status = status;
    partner.isApproved = isApproved;

    // ✅ ONLY WHEN APPROVED
    if (status === "ACTIVE") {
      partner.offerLetterUrl = `https://yourdomain.com/docs/offer-${partner._id}.pdf`;
      partner.certificateUrl = `https://yourdomain.com/docs/certificate-${partner._id}.pdf`;
      
      if (!partner.referralCode) {
        let referralCode;
        let isUnique = false;
        while (!isUnique) {
          referralCode = generateReferralCode();
          const existing = await ReferralPartner.findOne({ referralCode });
          if (!existing) isUnique = true;
        }
        const envUrl = process.env.FRONTEND_URL;
        const frontendUrl = (envUrl && !envUrl.includes('localhost')) ? envUrl : 'https://partner.dgtlmart.com';
        partner.referralCode = referralCode;
        partner.referralLink = `${frontendUrl}/buy-franchise?ref=${referralCode}`;
      }
    }

    await partner.save();

    res.json({
      message: `Partner status updated to ${status} successfully`,
      partner
    });

  } catch (error) {
    console.error('Error updating partner status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update referral partner commission (protected)
exports.updateReferralCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalCommission } = req.body;

    if (totalCommission === undefined || totalCommission < 0) {
      return res.status(400).json({ error: 'Invalid commission value' });
    }

    const partner = await ReferralPartner.findByIdAndUpdate(
      id,
      { totalCommission },
      { new: true }
    );

    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    res.json({
      message: 'Commission updated successfully',
      partner
    });
  } catch (error) {
    console.error('Error updating commission:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get all contact inquiries (protected)
exports.getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    res.json({
      contacts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Update contact status (protected)
exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ error: 'Contact inquiry not found' });
    }

    res.json({
      message: 'Contact status updated successfully',
      contact
    });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ error: 'Admin with this email does not exist' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    admin.resetPasswordToken = resetToken;
    admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await admin.save();

    // Send email
    await sendPasswordResetEmail(admin.email, resetToken, 'admin');

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
    const admin = await Admin.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    admin.password = password; // Admin model has pre-save hook for hashing
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;

    await admin.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Delete referral partner (protected)
exports.deleteReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await ReferralPartner.findByIdAndDelete(id);

    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Delete franchise buyer (protected)
exports.deleteBuyer = async (req, res) => {
  try {
    const buyer = await ReferralPartner.findByIdAndDelete(id);

    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    res.json({ message: 'Buyer deleted successfully' });
  } catch (error) {
    console.error('Error deleting buyer:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Delete contact inquiry (protected)
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

exports.updateFranchise = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await ReferralPartner.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Franchise not found" });
    }

    res.json({
      success: true,
      message: "Updated successfully",
      data: updated
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update payment status (protected)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!['pending', 'paid', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status value' });
    }

    const buyer = await ReferralPartner.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    );

    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    res.json({
      message: 'Payment status updated successfully',
      buyer
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get all users with role filter (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let result = [];

    if (!role || role === 'referral') {
      const referrals = await ReferralPartner.find().select('-password -__v').sort({ createdAt: -1 });
      result = result.concat(referrals.map(r => ({ ...r.toObject(), userType: 'referral' })));
    }
    if (!role || role === 'dost' || role === 'sathi') {
      const query = { partnerType: 'franchise' };
      // Note: 'role' mapping (dost/sathi) might be handled by commissionRate or a new field
      const buyers = await ReferralPartner.find(query).select('-password -__v').sort({ createdAt: -1 });
      result = result.concat(buyers.map(b => ({ ...b.toObject(), userType: b.partnerType })));
    }

    res.json({ users: result, total: result.length });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


// Update referral partner details (protected)
exports.updateReferral = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await ReferralPartner.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Failed to update referral" });
  }
};