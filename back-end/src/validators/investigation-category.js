// validators/investigation.validation.js
const { body, param, query } = require('express-validator');

// Validation for creating investigation category
const createInvestigationValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters'),

  body('code')
    .notEmpty()
    .withMessage('Code is required')
    .trim()
    .isLength({ max: 50 })
    .withMessage('Code must be less than 50 characters'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .trim()
    .isIn(['pndt', 'gbt', 'rbt', 'pelvic', "fm", "procedure",,"iui"])
    .withMessage('Invalid category type'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than or equal to 0'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('description')
    .optional({ checkFalsy: true }) // This will treat empty string as undefined
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Description must be between 3 and 1000 characters')
    .custom((value, { req }) => {
      // If category is 'procedure' or 'iui', description is required
      if (['procedure', 'iui'].includes(req.body.category) && (!value || value.trim() === '')) {
        throw new Error('Description is required for procedure and IUI tests');
      }
      return true;
    })
];

// Validation for updating investigation category
const updateInvestigationValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isMongoId()
    .withMessage('Invalid ID format'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters'),

  body('code')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Code must be less than 50 characters'),

  body('category')
    .optional()
    .trim()
    .isIn(['pndt', 'gbt', 'rbt', 'pelvic', "fm", "procedure","iui"])
    .withMessage('Invalid category type'),

  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than or equal to 0'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('description')
    .optional({ checkFalsy: true }) // This will treat empty string as undefined
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Description must be between 3 and 1000 characters')
    .custom((value, { req }) => {
      // If category is 'procedure' or 'iui', description is required
      if (['procedure', 'iui'].includes(req.body.category) && (!value || value.trim() === '')) {
        throw new Error('Description is required for procedure and IUI tests');
      }
      return true;
    })
];

// Validation for getting investigation by ID
const getInvestigationByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isMongoId()
    .withMessage('Invalid ID format')
];

// Validation for deleting investigation
const deleteInvestigationValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isMongoId()
    .withMessage('Invalid ID format')
];

// Validation for query parameters
const getInvestigationsValidation = [
  query('category')
    .optional()
    .trim()
    .isIn(['pndt', 'gbt', 'rbt', 'pelvic', "fm", "all", "procedure",,"iui"])
    .withMessage('Invalid category type'),


  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term too long'),
];

module.exports = {
  createInvestigationValidation,
  updateInvestigationValidation,
  getInvestigationByIdValidation,
  deleteInvestigationValidation,
  getInvestigationsValidation
};