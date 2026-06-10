const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema({
  franchiseBuyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReferralPartner',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  documentUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'signed', 'accepted', 'rejected'],
    default: 'draft'
  },
  sendDate: {
    type: Date,
    default: null
  },
  signedDate: {
    type: Date,
    default: null
  },
  signedBy: {
    name: String,
    email: String,
    timestamp: Date
  },
  notes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Agreement', agreementSchema);
