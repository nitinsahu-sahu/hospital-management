const { body } = require('express-validator');

exports.createGeneticInvestigationValidation = [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('category').isIn(['genetic']).withMessage('Invalid category'),
  body('investigations').isArray().withMessage('Investigations must be an array'),
  body('investigations.*._id').notEmpty().withMessage('Investigation ID is required'),
  body('investigations.*.code').notEmpty().withMessage('Investigation code is required'),
  body('investigations.*.name').notEmpty().withMessage('Investigation name is required'),
  body('investigations.*.category').isIn(['genetic']).withMessage('Invalid investigation category'),
  body('investigations.*.price').isNumeric().withMessage('Price must be a number'),
  body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
];

exports.updateGeneticInvestigationValidation = [
  body('category').optional().isIn(['genetic']).withMessage('Invalid category'),
  body('investigations').optional().isArray(),
  body('investigations.*._id').optional().notEmpty(),
  body('investigations.*.code').optional().notEmpty(),
  body('investigations.*.name').optional().notEmpty(),
  body('investigations.*.category').optional().isIn(['genetic']),
  body('investigations.*.price').optional().isNumeric(),
  body('totalAmount').optional().isNumeric(),
];