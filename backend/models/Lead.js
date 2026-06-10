const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },

  phone: {
    type: String,
    required: true
  },

  // 🔥 DGTLmart fields
  businessType: {
    type: String,
    default: ''
  },

  requirement: {
    type: String,
    required: true
  },

  website: {
    type: String,
    default: ''
  },

  // 🔥 UPDATED STATUS (IMPORTANT)
  status: {
    type: String,
    enum: [
      'new',
      'assigned',
      'in-progress',
      'approved',
      'converted',       // ✅ ADD
      'not-converted',   // ✅ ADD
      'closed',
      'lost'
    ],
    default: 'new'
  },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'assignedToModel',
    default: null
  },

  assignedToModel: {
    type: String,
    enum: ['ReferralPartner', 'FranchiseBuyer'],
    default: null
  },

  assignedToName: {
    type: String,
    default: null
  },

  notes: {
    type: String,
    default: ''
  },

  source: {
    type: String,
    enum: ['admin', 'website', 'referral', 'franchise', 'partner'],
    default: 'admin'
  },

  createdByName: {
    type: String,
    default: null
  },

  createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  refPath: 'createdByModel'
},

createdByModel: {
  type: String,
  enum: ['Admin', 'ReferralPartner'],
  default: 'Admin'
},

  // 🔥 APPROVAL SYSTEM
  sharingPercentage: {
    type: Number,
    default: 0
  },

  approvedAt: {
    type: Date
  },

  validTill: {
    type: Date
  },

 
  // 🔥 CONVERT SYSTEM (MOST IMPORTANT)

  amount: {
    type: Number,
    default: 0
  },

  service: {
    type: String,
    default: ''
  },

  commission: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);