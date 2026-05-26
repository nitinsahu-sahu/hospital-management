const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultation.controller');
const isAuth = require('../middlewares/isAuth.middleware');

router.use(isAuth)
// Create consultation
router.post('/create', consultationController.createConsultation);

// Get all consultations
router.get('/all', consultationController.getAllConsultations);

// Get single consultation
router.get('/:id', consultationController.getConsultation);

// Get single consultation
router.get('/patient/:id', consultationController.getConsultationByPatientId);

// Update consultation
router.put('/:id', consultationController.updateConsultation);

// Add additional fee to consultation
router.put('/:id/add-fee', consultationController.addAdditionalFee);

// Delete consultation
router.delete('/:id', consultationController.deleteConsultation);

module.exports = router;