const express = require('express');
const router = express.Router();
const bloodInvestigationController = require('../controllers/bloodInvestigation.controller');
const { 
  createBloodInvestigationValidation, 
  updateBloodInvestigationValidation 
} = require('../validators/bloodInvestigation.validation');
const { validate } = require('../middlewares/validate.middleware');
const isAuth = require('../middlewares/isAuth.middleware');


// All routes require authentication
router.use(isAuth);

// Routes
router.post(
  '/', 
  createBloodInvestigationValidation, 
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
  updateBloodInvestigationValidation, 
  validate, 
  bloodInvestigationController.updateBloodInvestigation
);

router.delete(
  '/:id', 
  bloodInvestigationController.deleteBloodInvestigation
);

router.get('/download/:routineId', bloodInvestigationController.routinesPdf);

module.exports = router;