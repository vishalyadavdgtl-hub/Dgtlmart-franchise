  console.log('JWT_SECRET:', process.env.JWT_SECRET);
  const jwt = require('jsonwebtoken');

  const adminMiddleware = (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }

      req.admin = decoded;
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token.' });
    }
  };

  module.exports = adminMiddleware;
