const mongoose = require('mongoose');
const ReferralPartner = require('./models/ReferralPartner');
const FranchiseBuyer = require('./models/FranchiseBuyer');
const Lead = require('./models/Lead');
require('dotenv').config();

const phone = '6284796246';

async function deleteUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const resultRP = await ReferralPartner.deleteMany({ phone });
    console.log(`Deleted ${resultRP.deletedCount} from ReferralPartner`);
    
    const resultFB = await FranchiseBuyer.deleteMany({ phone });
    console.log(`Deleted ${resultFB.deletedCount} from FranchiseBuyer`);
    
    const resultLead = await Lead.deleteMany({ phone });
    console.log(`Deleted ${resultLead.deletedCount} from Lead`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

deleteUser();
