const mongoose = require('mongoose');
const ReferralPartner = require('../models/ReferralPartner');
require('dotenv').config({ path: '.env' });

async function fixUserOptionalFields() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const email = 'vishalyadavdgtl@gmail.com';
    const user = await ReferralPartner.findOne({ email });

    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    user.status = 'PENDING';

    await user.save();
    console.log('User optional fields updated successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixUserOptionalFields();
