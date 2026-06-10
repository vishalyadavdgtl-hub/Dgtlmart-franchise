const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const agreementController = require('../controllers/agreement.controller');

// Send agreement (protected)
router.post('/send', authMiddleware, agreementController.sendAgreement);

// Get all agreements
router.get('/', authMiddleware, agreementController.getAgreements);

// Get agreement by ID
router.get('/:id', authMiddleware, agreementController.getAgreementById);

// Update agreement status (protected)
router.patch('/:id/status', authMiddleware, agreementController.updateAgreementStatus);

// Delete agreement (protected)
router.delete('/:id', authMiddleware, agreementController.deleteAgreement);

module.exports = router;
