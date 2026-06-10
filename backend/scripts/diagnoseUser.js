const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require(path.join(__dirname, '../models/Admin'));
const FranchiseBuyer = require(path.join(__dirname, '../models/FranchiseBuyer'));
const ReferralPartner = require(path.join(__dirname, '../models/ReferralPartner'));

const targetEmail = 'ankit.coolvick.sharma@gmail.com';

async function diagnoseUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const models = [
      { name: 'Admin', model: Admin },
      { name: 'FranchiseBuyer', model: FranchiseBuyer },
      { name: 'ReferralPartner', model: ReferralPartner }
    ];

    for (const { name, model } of models) {
      console.log(`Searching in ${name}...`);
      const users = await model.find({ email: targetEmail });

      if (users.length > 0) {
        console.log(`✓ Found ${users.length} match(es) in ${name}`);
        users.forEach(u => {
          const uObj = u.toObject();
          delete uObj.password;
          console.log(JSON.stringify(uObj, null, 2));
        });
      } else {
        console.log(`✗ No matches in ${name}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('✗ Error diagnosing user:', error);
    process.exit(1);
  }
}

diagnoseUser();
