const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Admin = require('./models/Admin');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const hash = await bcrypt.hash('Admin@123', 10);
  await Admin.updateOne({ username: 'admin' }, { $set: { password: hash } });
  console.log('Password force-reset to Admin@123');
  process.exit(0);
}).catch(console.error);
