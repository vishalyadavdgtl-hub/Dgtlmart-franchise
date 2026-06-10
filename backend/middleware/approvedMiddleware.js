const jwt = require('jsonwebtoken');
const ReferralPartner = require('../models/ReferralPartner');

const approvedMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    req.partner = decoded; // Support for legacy code using req.partner

    // Check approval status in DB to ensure real-time enforcement
    const partner = await ReferralPartner.findById(decoded.id).select('status isApproved');
    
    if (!partner) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (partner.status !== 'ACTIVE' || !partner.isApproved) {
      return res.status(403).json({ 
        error: 'Your account is under review. Please wait for admin approval.',
        status: partner.status,
        isApproved: partner.isApproved
      });
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = approvedMiddleware;
