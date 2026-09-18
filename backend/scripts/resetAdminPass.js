const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dgtlmart')
  .then(async () => {
    const admin = await Admin.findOne({ username: 'admin' });
    if (admin) {
      admin.password = 'admin123';
      await admin.save();
      console.log("Password reset successfully. ID: admin / Pass: admin123");
    } else {
      console.log("Admin not found.");
    }
    process.exit(0);
  });
