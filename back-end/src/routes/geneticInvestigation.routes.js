const express = require('express');
const router = express.Router();
const geneticInvestigationController = require('../controllers/geneticInvestigation.controller');
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
  geneticInvestigationController.createBloodInvestigation
);

router.get(
  '/', 
  geneticInvestigationController.getAllBloodInvestigations
);

router.get(
  '/patient/:patientId', 
  geneticInvestigationController.getBloodInvestigationByPatientId
);

router.get(
  '/:id', 
  geneticInvestigationController.getBloodInvestigationById
);

router.put(
  '/:id', 
  updateGeneticInvestigationValidation, 
  validate, 
  geneticInvestigationController.updateBloodInvestigation
);

router.delete(
  '/:id', 
  geneticInvestigationController.deleteBloodInvestigation
);

router.get('/download/:geneticId', geneticInvestigationController.geneticPdf);


module.exports = router;