const express = require('express');
const router = express.Router();
const investigationController = require('../controllers/investigation.controller');
const { createInvestigationValidation, updateInvestigationValidation } = require('../validators/investigation.validation');
const { validate } = require('../middlewares/validate.middleware');
const isAuth = require('../middlewares/isAuth.middleware');


// All routes require authentication
router.use(isAuth);

// Routes
router.post('/', createInvestigationValidation, validate, investigationController.createInvestigation);
router.get('/', investigationController.getAllInvestigations);
router.get('/patient/:patientId', investigationController.getInvestigationByPatientId);
router.get('/:id', investigationController.getInvestigationById);
router.put('/:id', updateInvestigationValidation, validate, investigationController.updateInvestigation);
router.delete('/:id', investigationController.deleteInvestigation);

module.exports = router;