require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');

// Force IPv4 for DNS lookups to fix Atlas ETIMEOUT issues
dns.setDefaultResultOrder('ipv4first');

const referralRoutes = require('./routes/referral.routes');
const franchiseRoutes = require('./routes/franchise.routes');
const adminRoutes = require('./routes/admin.routes');
const authRoutes = require('./routes/auth.routes');
const packageRoutes = require('./routes/package.routes');
const trainingRoutes = require('./routes/training.routes');
const agreementRoutes = require('./routes/agreement.routes');
const leadRoutes = require('./routes/lead.routes');
const explorePackageRoutes = require('./routes/explorePackage.routes');


const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://partner.dgtlmart.com',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Safely reject CORS without throwing a 500 error
      callback(null, false); 
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

// Routes
app.use('/api/referral', referralRoutes);
app.use('/api/franchise', franchiseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/explore-packages', explorePackageRoutes); // ✅ correct
app.use('/api/packages', packageRoutes); // ✅ correct/ Service Explore Packages (Dynamic Section)
app.use('/api/training', trainingRoutes);  // Public GET & Admin protected POST/PUT/DELETE
app.use('/api/admin/training', trainingRoutes);  // Same router for consistent admin routes
app.use('/api/agreements', agreementRoutes);  // Admin protected routes
app.use('/api/admin/agreements', agreementRoutes);  // Same router for consistent admin routes
app.use('/api/leads', leadRoutes);  // Lead management routes
app.use('/api/partner-packages', packageRoutes);  // Partner Packages (Starter, Professional, etc.)

console.log('JWT_SECRET:', process.env.JWT_SECRET)
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Franchise API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// MongoDB connection
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ Connected to MongoDB');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      const envUrl = process.env.FRONTEND_URL;
      const displayUrl = (envUrl && !envUrl.includes('localhost')) 
        ? envUrl 
        : 'https://partner.dgtlmart.com';
      console.log(`✓ Frontend URL: ${displayUrl}`);
    });
  })
  .catch((error) => {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});
