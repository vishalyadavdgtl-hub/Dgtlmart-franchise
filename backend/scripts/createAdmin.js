require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function createDefaultAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: process.env.ADMIN_DEFAULT_USERNAME || 'admin' });

    if (existingAdmin) {
      console.log('✗ Default admin user already exists');
      process.exit(0);
    }

    // Create default admin
    const admin = new Admin({
      username: process.env.ADMIN_DEFAULT_USERNAME || 'admin',
      email: 'admin@dgtlmart.com',
      password: process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123',
      role: 'admin'
    });

    await admin.save();
    console.log('✓ Default admin created successfully');
    console.log(`  Username: ${admin.username}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: ${process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123'}`);
    console.log('\n⚠ Please change the default password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating admin:', error);
    process.exit(1);
  }
}

createDefaultAdmin();
