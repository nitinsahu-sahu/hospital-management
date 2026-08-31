const express = require('express');
const router = express.Router();
const {
  createPatientExamination,
  getPatientExaminationByPatientId,
  getPatientExaminationById,
  updatePatientExamination,
  deletePatientExamination,patientExaminationPdf
} = require('../controllers/patientExamination.controller');
const isAuth = require('../middlewares/isAuth.middleware');
const { 
  createPatientExaminationValidation,
  updatePatientExaminationValidation 
} = require('../validators/patientExamination.validator');
const { validate } = require('../middlewares/validate.middleware');

// Create patient examination
router.post(
  "/create",
  isAuth,
  createPatientExaminationValidation,
  validate,
  createPatientExamination
);

// Get patient examination by patient ID
router.get("/patient/:patientId", isAuth, getPatientExaminationByPatientId);

// Get patient examination by ID
router.get("/:id", isAuth, getPatientExaminationById);

// Update patient examination by patient ID
router.put(
  "/update/:patientId",
  isAuth,
  updatePatientExaminationValidation,
  validate,
  updatePatientExamination
);

// Delete patient examination
router.delete("/delete/:id", isAuth, deletePatientExamination);

router.get('/download/:patientExaminationId', patientExaminationPdf);

module.exports = router;