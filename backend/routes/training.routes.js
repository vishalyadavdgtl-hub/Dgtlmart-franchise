const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const trainingController = require('../controllers/training.controller');

// Get all training modules (public)
router.get('/', trainingController.getTrainingModules);

// Get training module by ID (public)
router.get('/:id', trainingController.getTrainingModuleById);

// Protected admin routes for training modules
router.post('/', authMiddleware, trainingController.createTrainingModule);
router.put('/:id', authMiddleware, trainingController.updateTrainingModule);
router.delete('/:id', authMiddleware, trainingController.deleteTrainingModule);

module.exports = router;
