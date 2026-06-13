const express = require('express');
const router = express.Router();
const bloodInvestigationController = require('../controllers/geneticInvestigation.controller');
const { 
  createGeneticInvestigationValidation, 
  updateGeneticInvestigationValidation 
} = require('../validators/geneticInvestigation.validation');
const { validate } = require('../middlewares/validate.middleware');
const isAuth = require('../middlewares/isAuth.middleware');


// All routes require authentication
router.use(isAuth);

// Routes
router.post(
  '/', 
  createGeneticInvestigationValidation, 
  validate, 
  bloodInvestigationController.createBloodInvestigation
);

router.get(
  '/', 
  bloodInvestigationController.getAllBloodInvestigations
);

router.get(
  '/patient/:patientId', 
  bloodInvestigationController.getBloodInvestigationByPatientId
);

router.get(
  '/:id', 
  bloodInvestigationController.getBloodInvestigationById
);

router.put(
  '/:id', 
  updateGeneticInvestigationValidation, 
  validate, 
  bloodInvestigationController.updateBloodInvestigation
);

router.delete(
  '/:id', 
  bloodInvestigationController.deleteBloodInvestigation
);

module.exports = router;