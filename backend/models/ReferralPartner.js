const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const referralPartnerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  businessName: {
    type: String,
    trim: true
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  pincode: {
    type: String
  },
  agreementAccepted: {
    type: Boolean,
    default: false
  },
  agreementAcceptedDate: {
    type: Date
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
    default: null
  },
  referralLink: {
    type: String,
    default: null
  },
  referralCount: {
    type: Number,
    default: 0
  },
  totalCommission: {
    type: Number,
    default: 0
  },
  partnerType: {
    type: String,
    enum: ['referral', 'franchise'],
    default: 'referral'
  },

  // ✅ FIXED — franchiseType add kiya (pehle missing tha)
  franchiseType: {
    type: String,
    enum: ['referral', 'dost', 'sathi', null],
    default: null
  },

  role: {
    type: String,
    enum: ['referral', 'dost', 'sathi'],
    default: 'referral'
  },
  commissionRate: {
    type: Number,
    default: 10
  },
  selectedPackage: {
    packageName: String, // ✅ FIXED — 'name' ki jagah 'packageName' (controller se match)
    category: String,
    price: Number
  },
  territory: {
    type: String,
    default: null
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
  isApproved: {
    type: Boolean,
    default: false
  },
  offerLetterUrl: {
    type: String,
    default: null
  },
  certificateUrl: {
    type: String,
    default: null
  },
  profileImage: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'REJECTED'],
    default: 'PENDING'
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
referralPartnerSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
referralPartnerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('ReferralPartner', referralPartnerSchema);