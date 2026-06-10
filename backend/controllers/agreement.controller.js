const Agreement = require('../models/Agreement');
const ReferralPartner = require('../models/ReferralPartner');
const { sendAgreementEmail } = require('../utils/emailService');

// Create and send agreement
exports.sendAgreement = async (req, res) => {
  try {
    const { franchiseBuyerId, title, content, documentUrl } = req.body;

    if (!franchiseBuyerId || !title || !content) {
      return res.status(400).json({ error: 'Franchise buyer ID, title, and content are required' });
    }

    const buyer = await ReferralPartner.findById(franchiseBuyerId);
    if (!buyer) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    const agreement = new Agreement({
      franchiseBuyer: franchiseBuyerId,
      title,
      content,
      documentUrl: documentUrl || null,
      status: 'sent',
      sendDate: new Date(),
      createdBy: req.user.id
    });

    const savedAgreement = await agreement.save();

    // Send email to franchise buyer
    try {
      await sendAgreementEmail(buyer.email, buyer.fullName, title, documentUrl);
    } catch (emailError) {
      console.error('Error sending agreement email:', emailError);
    }

    res.status(201).json({
      message: 'Agreement sent successfully',
      agreement: savedAgreement
    });
  } catch (error) {
    console.error('Error sending agreement:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get all agreements
exports.getAgreements = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, franchiseBuyerId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (franchiseBuyerId) query.franchiseBuyer = franchiseBuyerId;

    const total = await Agreement.countDocuments(query);
    const agreements = await Agreement.find(query)
      .populate('franchiseBuyer', 'fullName email businessName')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      agreements,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching agreements:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get agreement by ID
exports.getAgreementById = async (req, res) => {
  try {
    const { id } = req.params;

    const agreement = await Agreement.findById(id)
      .populate('franchiseBuyer', 'fullName email businessName')
      .populate('createdBy', 'username email');

    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }

    res.json(agreement);
  } catch (error) {
    console.error('Error fetching agreement:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Update agreement status
exports.updateAgreementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, signedBy, notes } = req.body;

    if (!['draft', 'sent', 'signed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updateData = { status, notes: notes || '' };

    if (status === 'signed' && signedBy) {
      updateData.signedDate = new Date();
      updateData.signedBy = {
        name: signedBy.name,
        email: signedBy.email,
        timestamp: new Date()
      };
    }

    const updatedAgreement = await Agreement.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('franchiseBuyer', 'fullName email businessName')
     .populate('createdBy', 'username email');

    if (!updatedAgreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }

    res.json({
      message: 'Agreement status updated successfully',
      agreement: updatedAgreement
    });
  } catch (error) {
    console.error('Error updating agreement status:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Delete agreement
exports.deleteAgreement = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAgreement = await Agreement.findByIdAndDelete(id);

    if (!deletedAgreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }

    res.json({
      message: 'Agreement deleted successfully',
      agreement: deletedAgreement
    });
  } catch (error) {
    console.error('Error deleting agreement:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};
