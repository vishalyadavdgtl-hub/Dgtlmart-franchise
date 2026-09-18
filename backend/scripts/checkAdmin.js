const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dgtlmart')
  .then(async () => {
    const admins = await Admin.find({});
    console.log("Admins found:");
    admins.forEach(a => console.log(a.username, a.email));
    
    // If no admin, create one
    if (admins.length === 0) {
      console.log("No admins found, creating default admin...");
      const newAdmin = new Admin({
        username: 'admin',
        email: 'admin@dgtlmart.com',
        password: 'password123',
        role: 'admin'
      });
      await newAdmin.save();
      console.log("Created admin: admin / password123");
    }
    process.exit(0);
  });
