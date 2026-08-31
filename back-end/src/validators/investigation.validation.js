const { body } = require('express-validator');

exports.createInvestigationValidation = [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('investigations').isArray().withMessage('Investigations must be an array'),
  body('investigations.*.id').notEmpty().withMessage('Investigation ID is required'),
  body('investigations.*.name').notEmpty().withMessage('Investigation name is required'),
  body('investigations.*.category').isIn(['pndt', 'gynae', 'pelvic',"fm"]).withMessage('Invalid category'),
  body('investigations.*.price').isNumeric().withMessage('Price must be a number'),
  body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
  body('status').optional().isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid status')
];

exports.updateInvestigationValidation = [
  body('investigations').optional().isArray(),
  body('investigations.*.id').optional().notEmpty(),
  body('investigations.*.name').optional().notEmpty(),
  body('investigations.*.category').optional().isIn(['pndt', 'gynae', 'pelvic',"fm"]),
  body('investigations.*.price').optional().isNumeric(),
  body('totalAmount').optional().isNumeric(),
  body('status').optional().isIn(['pending', 'completed', 'cancelled'])
];