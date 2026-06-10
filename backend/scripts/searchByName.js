const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require(path.join(__dirname, '../models/Admin'));
const FranchiseBuyer = require(path.join(__dirname, '../models/FranchiseBuyer'));
const ReferralPartner = require(path.join(__dirname, '../models/ReferralPartner'));

async function searchByName() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const models = [
      { name: 'Admin', model: Admin },
      { name: 'FranchiseBuyer', model: FranchiseBuyer },
      { name: 'ReferralPartner', model: ReferralPartner }
    ];

    for (const { name, model } of models) {
      console.log(`Searching for "Ankit" in ${name}...`);
      // Use regex for case-insensitive search in fullName or username
      const query = name === 'Admin' ? { username: /Ankit/i } : { fullName: /Ankit/i };
      const users = await model.find(query);

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
    console.error('✗ Error searching by name:', error);
    process.exit(1);
  }
}

searchByName();
