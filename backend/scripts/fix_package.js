
const mongoose = require('mongoose');
const ReferralPartner = require('../models/ReferralPartner');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function fixUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const email = 'vishalyadavdgtl@gmail.com';
    const user = await ReferralPartner.findOne({ email });

    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    user.selectedPackage = {
      packageName: 'Dost',
      price: 49999, // Adjust if you know the exact price
    };
    user.paymentAmount = 49999;
    user.paymentStatus = 'paid';

    await user.save();
    console.log('User package updated successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixUser();
