const express = require('express');
const router = express.Router();
const {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    getRoleWise
} = require('../controllers/patient.controller');


router.post("/", createPatient);
router.get("/role", getRoleWise);
router.get("/", getPatients);
router.get("/:id", getPatientById);
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);

module.exports = router;