const express = require('express');
const router = express.Router();
const procedureController = require('../controllers/procedure.controller');
const isAuth = require('../middlewares/isAuth.middleware');

// All routes protected with auth middleware
router.use(isAuth);

// Create procedure
router.post('/create', procedureController.createProcedure);

// Get all procedures (with optional filters)
router.get('/all', procedureController.getAllProcedures);

// Get procedures by patient ID
router.get('/patient/:patientId', procedureController.getProceduresByPatientId);

// Get single procedure by ID
router.get('/:id', procedureController.getProcedureById);

// Update procedure
router.put('/:id', procedureController.updateProcedure);

// Delete procedure
router.delete('/:id', procedureController.deleteProcedure);

router.get('/download/:procedureId', procedureController.procedurePdf);

module.exports = router;