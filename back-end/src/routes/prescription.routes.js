
const express = require('express');
const router = express.Router();
const {
    createPrescription,
  getPrescriptionsByPatient,
  updatePrescription,prescriptionPdf
} = require('../controllers/prescription.controller');
const isAuth = require('../middlewares/isAuth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
    updatePrescriptionValidation,createPrescriptionValidation
} = require('../validators/prescription.validation');

router.use(isAuth);

// Create prescription
router.post("/",createPrescriptionValidation,validate, createPrescription);

// Get prescriptions by patient ID
router.get("/:patientId", getPrescriptionsByPatient);

// Update prescription
router.put("/:id",updatePrescriptionValidation, validate, updatePrescription);

router.get('/download/:prescriptionId', prescriptionPdf);

module.exports = router;
