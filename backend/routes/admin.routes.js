const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

// Admin login
router.post('/login', adminController.login);

// Get all referral partners (protected)
router.get('/referrals', authMiddleware, adminController.getReferrals);

// Get all franchise buyers (protected)
router.get('/franchise-buyers', authMiddleware, adminController.getFranchiseBuyers);

// Get dashboard statistics (protected)
router.get('/dashboard-stats', authMiddleware, adminController.getDashboardStats);

// Update buyer status (protected)
router.patch('/buyer/:id/status', authMiddleware, adminController.updateBuyerStatus);

// Update referral partner status (protected)
router.patch('/referral/:id/status', authMiddleware, adminController.updateReferralStatus);

// Update referral partner commission (protected)
router.patch('/referral/:id/commission', authMiddleware, adminController.updateReferralCommission);

// Get all contact inquiries (protected)
router.get('/contacts', authMiddleware, adminController.getContacts);

// Update contact status (protected)
router.patch('/contact/:id/status', authMiddleware, adminController.updateContactStatus);

// Forgot Password
router.post('/forgot-password', adminController.forgotPassword);

// Reset Password
router.post('/reset-password/:token', adminController.resetPassword);

// Delete referral partner (protected)
router.delete('/referral/:id', authMiddleware, adminController.deleteReferral);

// Delete franchise buyer (protected)
router.delete('/buyer/:id', authMiddleware, adminController.deleteBuyer);

// Delete contact inquiry (protected)
router.delete('/contact/:id', authMiddleware, adminController.deleteContact);

// Admin edit franchise buyer details (protected)
router.put('/franchise/:id', authMiddleware, adminController.updateFranchise);

// Update payment status (protected)
router.patch('/buyer/:id/payment-status', authMiddleware, adminController.updatePaymentStatus);

// Get all users (protected, with role filter)
router.get('/users', authMiddleware, adminController.getAllUsers);

// Update referral partner details (protected)
router.put('/referral/:id', authMiddleware, adminController.updateReferral);

// ✅ Admin kisi bhi partner ka pura dashboard data dekh sakta hai
router.get('/partner-dashboard/:partnerId', authMiddleware, async (req, res) => {
  try {
    const ReferralPartner = require('../models/ReferralPartner');
    const partner = await ReferralPartner.findById(req.params.partnerId).select('-password');

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

    const pendingApprovals = await ReferralPartner.countDocuments({
      referredBy: partner._id,
      status: 'PENDING'
    });

    res.json({
      _id: partner._id,
      fullName: partner.fullName,
      email: partner.email,
      phone: partner.phone,
      address: partner.address,
      profileImage: partner.profileImage,
      referralCode: partner.referralCode,
      referralLink: dynamicReferralLink,
      referralCount: partner.referralCount,
      totalCommission: partner.totalCommission,
      role: partner.partnerType,
      partnerType: partner.partnerType,
      franchiseType: partner.franchiseType,
      commissionRate: partner.commissionRate,
      status: partner.status,
      joinedDate: partner.createdAt,
      selectedPackage: partner.selectedPackage,
      paymentStatus: partner.paymentStatus,
      agreementStatus: partner.agreementStatus,
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

  } catch (err) {
    console.error('Error fetching partner dashboard:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Admin ke liye specific partner ke leads fetch karo
router.get('/partner-leads/:partnerId', authMiddleware, async (req, res) => {
  try {
    const Lead = require('../models/Lead');
    const leads = await Lead.find({ assignedTo: req.params.partnerId }).sort({ createdAt: -1 });
    res.json({ leads });
  } catch (err) {
    console.error('Error fetching partner leads:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ NAYA — Admin partner ka data edit/update kare
router.put('/partner-update/:id', authMiddleware, async (req, res) => {
  try {
    const ReferralPartner = require('../models/ReferralPartner');

    // Sirf allowed fields update hongi — security ke liye
    const allowedFields = [
      'fullName',
      'email',
      'phone',
      'address',
      'status',
      'commissionRate',
      'referralCount',
      'pendingApprovals',
      'paymentStatus',
      'agreementStatus',
      'role',
      'partnerType',
      'franchiseType',
      'referralLink',
    ];

    // Req body se sirf allowed fields nikaalo
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Koi valid field nahi mili update karne ke liye' });
    }

    const updated = await ReferralPartner.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    console.log(`✅ Admin ne partner ${req.params.id} update kiya:`, updateData);

    res.json({
      success: true,
      message: 'Partner updated successfully',
      partner: updated,
    });

  } catch (err) {
    console.error('Error updating partner:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ NAYA — Admin lead ka status update kare (edit mode mein)
router.put('/leads/:leadId/status', authMiddleware, async (req, res) => {
  try {
    const Lead = require('../models/Lead');
    const { status } = req.body;

    const validStatuses = ['new', 'assigned', 'in-progress', 'approved', 'converted', 'lost'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updated = await Lead.findByIdAndUpdate(
      req.params.leadId,
      { $set: { status } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ success: true, lead: updated });

  } catch (err) {
    console.error('Error updating lead status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;