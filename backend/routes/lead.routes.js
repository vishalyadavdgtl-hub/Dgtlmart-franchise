

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const leadController = require('../controllers/lead.controller');

// ✅ Partner routes (partnerToken) - PEHLE rakho
router.post('/', authMiddleware, leadController.createLead);
router.get('/my/assigned', authMiddleware, leadController.getMyLeads);
// router.get('/offer-letter/:id', authMiddleware, leadController.downloadOfferLetter);
// router.get('/certificate/:id', authMiddleware, leadController.downloadCertificate);

// ✅ Admin routes (adminToken) - BAAD mein rakho
router.get('/', adminMiddleware, leadController.getAllLeads);
router.get('/:id', adminMiddleware, leadController.getLeadById);
router.patch('/:id/assign', adminMiddleware, leadController.assignLead);
router.patch('/:id/status', adminMiddleware, leadController.updateLeadStatus);
router.put('/approve/:id', adminMiddleware, leadController.approveLead);
router.put('/convert/:id', adminMiddleware, leadController.convertLead);
router.put('/:id', adminMiddleware, leadController.updateLead);
router.delete('/:id', adminMiddleware, leadController.deleteLead);

module.exports = router;
