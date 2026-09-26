const mongoose = require('mongoose');
const ReferralPartner = require('./models/ReferralPartner');
require('dotenv').config();

async function fixVishal() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://dgtlmarttech_db_user:GognVTBpQRRWZwZb@cluster0.twmpfgv.mongodb.net/Franchise?retryWrites=true&w=majority');
    console.log('Connected to DB');

    const result = await ReferralPartner.findOneAndUpdate(
      { email: 'vishalyadavdgtl@gmail.com' },
      { 
        $set: { 
          detailsStatus: 'APPROVED', 
          meetingStatus: 'COMPLETED',
          status: 'ACTIVE',
          agreementAccepted: true,
          agreementStatus: 'signed',
          commissionRate: 60
        } 
      },
      { new: true }
    );

    if (result) {
      console.log('Successfully updated Vishal:', result.fullName, result.email);
      console.log('New Details Status:', result.detailsStatus);
      console.log('New Meeting Status:', result.meetingStatus);
    } else {
      console.log('Could not find user vishalyadavdgtl@gmail.com');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

fixVishal();
