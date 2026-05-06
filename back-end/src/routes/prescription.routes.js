
const express = require('express');
const router = express.Router();
const {
    createPrescription,
  getPrescriptions,
  getPrescriptionById,
  getPrescriptionsByPatient,
  updatePrescription,
  deletePrescription,
  updatePrescriptionStatus,
  getPrescriptionStats,
  getPrescriptionsByDoctor
} = require('../controllers/prescription.controller');

// Create prescription
router.post("/", createPrescription);

// Get all prescriptions (with filters)
router.get("/", getPrescriptions);

// Get prescription statistics
router.get("/stats", getPrescriptionStats);

// Get single prescription
router.get("/:id", getPrescriptionById);

// Get prescriptions by patient ID
router.get("/patient/:patientId", getPrescriptionsByPatient);

// Get prescriptions by doctor ID
router.get("/doctor/:doctorId", getPrescriptionsByDoctor);

// Update prescription
router.put("/:id", updatePrescription);

// Update prescription status
router.patch("/:id/status", updatePrescriptionStatus);

// Delete prescription
router.delete("/:id", deletePrescription);

module.exports = router;
