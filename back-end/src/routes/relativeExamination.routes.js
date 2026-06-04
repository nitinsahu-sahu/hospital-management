// routes/relativeExamination.routes.js
const express = require('express');
const router = express.Router();
const {
  createRelativeExamination,
  getRelativeExaminationByPatientId,
  getRelativeExaminationByRelativeId,
  getRelativeExaminationById,
  updateRelativeExamination,
  deleteRelativeExamination
} = require('../controllers/relativeExamination.controller');
const isAuth = require('../middlewares/isAuth.middleware');
const { 
  createRelativeExaminationValidation,
  updateRelativeExaminationValidation 
} = require('../validators/relativeExamination.validator');
const { validate } = require('../middlewares/validate.middleware');

// Create relative examination
router.post(
  "/create/:patientId/:relativeId",
  isAuth,
  createRelativeExaminationValidation,
  validate,
  createRelativeExamination
);

// Get relative examinations by patient ID
router.get("/patient/:patientId", isAuth, getRelativeExaminationByPatientId);

// Get relative examination by relative ID
router.get("/relative/:relativeId", isAuth, getRelativeExaminationByRelativeId);

// Get relative examination by ID
router.get("/:id", isAuth, getRelativeExaminationById);

// Update relative examination by relative ID
router.put(
  "/update/:relativeId",
  isAuth,
  updateRelativeExaminationValidation,
  validate,
  updateRelativeExamination
);

// Delete relative examination
router.delete("/delete/:id", isAuth, deleteRelativeExamination);

module.exports = router;