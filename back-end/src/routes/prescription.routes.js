
const express = require('express');
const router = express.Router();
const {
    createPrescription,
  getPrescriptionsByPatient,
  updatePrescription,
} = require('../controllers/prescription.controller');
const isAuth = require('../middlewares/isAuth.middleware');


router.use(isAuth);

// Create prescription
router.post("/", createPrescription);

// Get prescriptions by patient ID
router.get("/:patientId", getPrescriptionsByPatient);

// Update prescription
router.put("/:id", updatePrescription);

module.exports = router;
