// routes/investigation.routes.js
const express = require('express');
const router = express.Router();
const investigationCategoryController = require('../controllers/investigation-category');
const { 
  createInvestigationValidation,
  updateInvestigationValidation,
  getInvestigationByIdValidation,
  deleteInvestigationValidation,
  getInvestigationsValidation
} = require('../validators/investigation-category');
const { validate } = require('../middlewares/validate.middleware');
const isAuth = require('../middlewares/isAuth.middleware');

// All routes require authentication
router.use(isAuth);

// Investigation CRUD Routes
router.post(
  '/',
  createInvestigationValidation,
  validate,
  investigationCategoryController.createInvestigation
);

router.get(
  '/',
  getInvestigationsValidation,
  validate,
  investigationCategoryController.getInvestigations
);

// Get all unique categories
router.get(
  '/categories',
  investigationCategoryController.getAllCategories
);

// Get investigations by category
router.get(
  '/category/:category',
  investigationCategoryController.getInvestigationsByCategory
);

router.get(
  '/:id',
  getInvestigationByIdValidation,
  validate,
  investigationCategoryController.getInvestigationById
);

router.put(
  '/:id',
  updateInvestigationValidation,
  validate,
  investigationCategoryController.updateInvestigation
);

// Soft delete
router.delete(
  '/:id',
  deleteInvestigationValidation,
  validate,
  investigationCategoryController.deleteInvestigation
);

// Hard delete (permanent)
router.delete(
  '/:id/hard',
  deleteInvestigationValidation,
  validate,
  investigationCategoryController.hardDeleteInvestigation
);

module.exports = router;