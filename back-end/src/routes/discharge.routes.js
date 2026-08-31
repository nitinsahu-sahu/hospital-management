// routes/discharge.routes.js
const express = require('express');
const router = express.Router();
const dischargeController = require('../controllers/discharge.controller');
const isAuth = require('../middlewares/isAuth.middleware');

router.use(isAuth)

// Create or update discharge summary
router.post('/create', dischargeController.createDischarge);

// Get full discharge data for a patient
// router.get('/data/:patientId/:consultationId', dischargeController.getFullDischargeData);
router.put('/:id', dischargeController.updateDischarge);

// Download discharge PDF
router.get('/download/:patientId', dischargeController.downloadDischargePDF);

router.get('/patient/:patientId', dischargeController.getDischargeByPatientId);


module.exports = router;