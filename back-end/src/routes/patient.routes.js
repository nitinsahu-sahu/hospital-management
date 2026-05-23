const express = require('express');
const router = express.Router();
const {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    getRoleWise,
    createRelative
} = require('../controllers/patient.controller');
const isAuth = require('../middlewares/isAuth.middleware');
const { createPatientValidation, createRelativeValidation } = require('../validators/user.validator');
const { validate } = require('../middlewares/validate.middleware');

router.post("/create", isAuth, createPatientValidation, validate, createPatient);
router.post("/relative/create", isAuth, createRelativeValidation, validate, createRelative);

router.get("/role", getRoleWise);
router.get("/", getPatients);
router.get("/:id", getPatientById);
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);

module.exports = router;