const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const packageController = require('../controllers/package.controller');

// Get all packages (public)
router.get('/', packageController.getPackages);

// Get package by ID (public)
router.get('/:id', packageController.getPackageById);

// Protected admin routes for packages
router.post('/', authMiddleware, packageController.createPackage);
router.put('/:id', authMiddleware, packageController.updatePackage);
router.delete('/:id', authMiddleware, packageController.deletePackage);

module.exports = router;
