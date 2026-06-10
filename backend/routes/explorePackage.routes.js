const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const explorePackageController = require('../controllers/explorePackage.controller');

// Public — frontend uses this to show packages
router.get('/', explorePackageController.getPackages);
router.get('/:id', explorePackageController.getPackageById);

// Admin protected routes
router.post('/', authMiddleware, explorePackageController.createPackage);
router.put('/:id', authMiddleware, explorePackageController.updatePackage);
router.delete('/:id', authMiddleware, explorePackageController.deletePackage);

module.exports = router;