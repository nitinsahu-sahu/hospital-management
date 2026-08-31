const express = require('express');
const router = express.Router();
const {
  createConsultation,
  getAllConsultations,
  getConsultationsByPatientId,
  getConsultation,
  updateConsultation,
  addAdditionalFee,
  deleteConsultation,
  getPatientConsultationStats,
  consultationPdf
} = require('../controllers/consultationNew.controller');
const isAuth = require('../middlewares/isAuth.middleware');


// Apply auth middleware to all routes
router.use(isAuth);

router.get('/download/:consultantaionId', consultationPdf);

// Create consultation
router.post('/create', createConsultation);

// Get all consultations with pagination
router.get('/all', getAllConsultations);

// Get all consultations for a specific patient
router.get('/patient/:patientId', getConsultationsByPatientId);

// Get patient consultation statistics
router.get('/patient/:patientId/stats', getPatientConsultationStats);

// Get single consultation by ID
router.get('/:id', getConsultation);

// Update consultation
router.put('/:id', updateConsultation);

// Add additional fee to consultation
router.post('/:id/additional-fee', addAdditionalFee);

// Delete consultation
router.delete('/:id', deleteConsultation);

module.exports = router;