 const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const ReferralPartner = require('../models/ReferralPartner');

// Create a new lead (Admin only)
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, requirement,businessType, website, priority, notes, source } = req.body;

    if (!name || !email || !phone || !requirement) {
      return res.status(400).json({ error: 'Name, email, phone, and requirement are required' });
    }

console.log("REQ.USER:", req.user);
console.log("REQ.PARTNER:", req.partner);

const lead = new Lead({
  name,
  email,
  phone,
  requirement,
  businessType,
  website,

  source: req.partner ? (req.partner.role === 'franchise' ? 'franchise' : 'referral') : (source || 'admin'),

  createdBy: req.partner?.id || req.user?.id,
  createdByModel: req.partner ? "ReferralPartner" : "Admin",
  createdByName: req.partner?.fullName || req.user?.name || req.user?.fullName || "Admin",

  // 🔥 FIX
  assignedTo: req.partner?.id || req.user?.id,
  assignedToModel: req.partner ? "ReferralPartner" : "Admin",
  assignedToName: req.partner?.fullName || req.user?.name || req.user?.fullName || "Admin"
});

await lead.save();

// 🔥 MOST IMPORTANT
console.log("CREATED LEAD:", lead);

   

    res.status(201).json({
      message: 'Lead created successfully',
      lead
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get all leads (Admin only)
exports.getAllLeads = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority, search, assignedTo } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { requirement: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'username email');

    res.json({
      leads,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get lead by ID
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('createdBy', 'username email');

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Assign lead to referral/franchise user (Admin only)
exports.assignLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedToId, assignedToModel } = req.body;

   console.log("REQ.USER:", req.user);
console.log("REQ.PARTNER:", req.partner);

    if (!assignedToId || !assignedToModel) {
      return res.status(400).json({ error: 'AssignedToId and assignedToModel are required' });
    }

    if (assignedToModel !== 'ReferralPartner') {
      return res.status(400).json({ error: 'Invalid assignedToModel. Must be ReferralPartner' });
    }

    // Get the assignee's name
    const partner = await ReferralPartner.findById(assignedToId).select('fullName');
    if (!partner) return res.status(404).json({ error: 'Partner not found' });
    const assigneeName = partner.fullName;

    const lead = await Lead.findByIdAndUpdate(
      id,
      {
        assignedTo: assignedToId,
        assignedToModel,
        assignedToName: assigneeName,
        status: 'assigned'
      },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({
      message: 'Lead assigned successfully',
      lead
    });
  } catch (error) {
    console.error('Error assigning lead:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Update lead status
exports.updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['new', 'assigned', 'in-progress', 'approved', 'closed', 'lost'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updateData = { status };
    if (notes !== undefined) updateData.notes = notes;

    const lead = await Lead.findByIdAndUpdate(id, updateData, { new: true });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({
      message: 'Lead status updated successfully',
      lead
    });
  } catch (error) {
    console.error('Error updating lead status:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Update a lead (Admin only)
exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, requirement, priority, notes, source } = req.body;

    const updated = await Lead.findByIdAndUpdate(
      id,
      { name, email, phone, requirement, priority, notes, source },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({
      message: 'Lead updated successfully',
      lead: updated
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Delete lead (Admin only)
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get leads assigned to current user (Referral / Franchise)
exports.getMyLeads = async (req, res) => {
  try {
    // ✅ JWT ke andar jo bhi id field ho
    const userId = req.partner?._id 
      || req.partner?.id 
      || req.user?._id 
      || req.user?.id;

    console.log("GET MY LEADS - userId:", userId);

    if (!userId) {
      return res.status(401).json({ error: "User not identified" });
    }

    const leads = await Lead.find({
      assignedTo: new mongoose.Types.ObjectId(userId)
    }).sort({ createdAt: -1 });

    res.json({ leads, total: leads.length });

  } catch (error) {
    console.error("Error fetching my leads:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// new  approved lead

exports.approveLead = async (req, res) => {
  try {
    const { sharingPercentage } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        sharingPercentage,
        approvedAt: new Date(),
        validTill: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      { new: true }
    );

    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

 // download certificate

// exports.downloadCertificate = async (req, res) => {
//   const lead = await Lead.findById(req.params.id);

//   const PDFDocument = require('pdfkit');
//   const doc = new PDFDocument();

//   res.setHeader("Content-Type", "application/pdf");
//   res.setHeader("Content-Disposition", "attachment; filename=certificate.pdf");

//   doc.pipe(res);

//   doc.fontSize(20).text("CERTIFICATE\n\n");
//   doc.text(`This is to certify that ${lead.name}`);
//   doc.text("is an authorized partner.");

//   doc.end();
// };

// download offer letter
// exports.downloadOfferLetter = async (req, res) => {
//   const lead = await Lead.findById(req.params.id);

//   const PDFDocument = require('pdfkit');
//   const doc = new PDFDocument();

//   res.setHeader("Content-Type", "application/pdf");
//   res.setHeader("Content-Disposition", "attachment; filename=offer-letter.pdf");

//   doc.pipe(res);

//   doc.fontSize(18).text("OFFER LETTER\n\n");
//   doc.text(`Name: ${lead.name}`);
//   doc.text(`Email: ${lead.email}`);
//   doc.text(`Sharing: ${lead.sharingPercentage}%`);
//   doc.text(`Valid Till: ${lead.validTill}`);

//   doc.end();
// };

// Convert lead to customer (Admin only)
exports.convertLead = async (req, res) => {
  try {
    const { amount, service } = req.body;

    const commission = amount * 0.2; // 20%

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        status: "converted",
        amount,
        service,
        commission
      },
      { new: true }
    );

    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};