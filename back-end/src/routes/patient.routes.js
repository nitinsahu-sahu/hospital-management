const express = require('express');
const router = express.Router();
const {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    createRelative
} = require('../controllers/patient.controller');
const isAuth = require('../middlewares/isAuth.middleware');
const { uploadImages } = require('../middlewares/upload.middleware');
const { createPatientValidation, createRelativeValidation } = require('../validators/user.validator');
const { validate } = require('../middlewares/validate.middleware');

router.post("/create", isAuth, uploadImages,createPatientValidation, validate,  createPatient);
router.post("/relative/create", isAuth, uploadImages,createRelativeValidation, validate,  createRelative);
router.get("/", getPatients);
// updatePatientValidation, validate,
router.get("/:id", getPatientById);
router.put("/:id", isAuth, uploadImages,  updatePatient);
router.delete("/:id", isAuth, deletePatient);

module.exports = router;