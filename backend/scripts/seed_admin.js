const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect('mongodb+srv://vishaldgtldb:Ram%40123@cluster0.llotsdg.mongodb.net/Franchise?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    const username = 'admin';
    const password = 'Admin@123';
    const email = 'admin@dgtlmart.com';

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    console.log('Creating new admin user...');
    // Create new admin
    const newAdmin = new Admin({
      username,
      email,
      password 
    });

    await newAdmin.save();
    console.log('✓ Default admin user created successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    if (error.errors) {
      console.error('Validation Errors:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
};

seedAdmin();
