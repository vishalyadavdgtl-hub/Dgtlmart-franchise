const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const franchiseBuyerSchema = new mongoose.Schema({
  fullName: {
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
  password: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
 
  selectedPackage: {
    category: {
      type: String,
      default: null
    },
    packageName: {
      type: String,
      default: null
    },
    price: {
      type: Number,
      default: 0
    }
  },
  couponCode: {
    type: String,
    default: null
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReferralPartner',
    default: null
  },
  role: {
    type: String,
    enum: ['dost', 'sathi'],
    default: 'dost'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  agreementStatus: {
    type: String,
    enum: ['pending', 'sent', 'signed', 'accepted', 'rejected'],
    default: 'pending'
  },
  razorpayOrderId: {
    type: String,
    default: null
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  paymentAmount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  trainingProgress: {
    totalModules: {
      type: Number,
      default: 0
    },
    completedModules: {
      type: Number,
      default: 0
    },
    modules: [{
      moduleId: mongoose.Schema.Types.ObjectId,
      completedAt: Date
    }]
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
franchiseBuyerSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
franchiseBuyerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('FranchiseBuyer', franchiseBuyerSchema);
