// validators/relativeExamination.validator.js
const { body, param } = require('express-validator');
const mongoose = require('mongoose');

// Create Relative Examination Validation
exports.createRelativeExaminationValidation = [
  body('patientId')
    .notEmpty()
    .withMessage('Patient ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid patient ID format');
      }
      return true;
    }),

  body('relativeId')
    .notEmpty()
    .withMessage('Relative ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid relative ID format');
      }
      return true;
    }),

  body('consultationId')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid consultation ID format');
      }
      return true;
    }),

  // Vitals
  body('vitals.pr').optional().trim().isString(),
  body('vitals.prUnit').optional().isIn(['bpm']).withMessage('Invalid PR unit'),
  body('vitals.bp').optional().trim().isString(),
  body('vitals.bpUnit').optional().isIn(['mmHg']).withMessage('Invalid BP unit'),
  body('vitals.height').optional().trim().isString(),
  body('vitals.heightUnit').optional().isIn(['cm', 'ft', 'inch']).withMessage('Invalid height unit'),
  body('vitals.weight').optional().trim().isString(),
  body('vitals.weightUnit').optional().isIn(['kg', 'lb']).withMessage('Invalid weight unit'),
  body('vitals.bmi').optional().trim().isString(),
  body('vitals.bmiUnit').optional().isIn(['kg/m²']).withMessage('Invalid BMI unit'),
  body('vitals.abdominalExamination').optional().trim().isString(),

  // System Examinations
  body('cns')
    .optional()
    .isIn(['normal', 'abnormal', ''])
    .withMessage('CNS must be normal, abnormal, or empty'),
  body('cnsDetails')
    .if(body('cns').equals('abnormal'))
    .notEmpty()
    .withMessage('CNS details are required when status is abnormal')
    .trim(),
  
  body('cvs')
    .optional()
    .isIn(['normal', 'abnormal', ''])
    .withMessage('CVS must be normal, abnormal, or empty'),
  body('cvsDetails')
    .if(body('cvs').equals('abnormal'))
    .notEmpty()
    .withMessage('CVS details are required when status is abnormal')
    .trim(),
  
  body('respiratorySystem')
    .optional()
    .isIn(['normal', 'abnormal', ''])
    .withMessage('Respiratory system must be normal, abnormal, or empty'),
  body('respiratorySystemDetails')
    .if(body('respiratorySystem').equals('abnormal'))
    .notEmpty()
    .withMessage('Respiratory system details are required when status is abnormal')
    .trim(),
  
  body('git')
    .optional()
    .isIn(['normal', 'abnormal', ''])
    .withMessage('GIT must be normal, abnormal, or empty'),
  body('gitDetails')
    .if(body('git').equals('abnormal'))
    .notEmpty()
    .withMessage('GIT details are required when status is abnormal')
    .trim(),
];

// Update Relative Examination Validation
exports.updateRelativeExaminationValidation = [
  // Vitals
  body('vitals.pr').optional().trim().isString(),
  body('vitals.prUnit').optional().isIn(['bpm']).withMessage('Invalid PR unit'),
  body('vitals.bp').optional().trim().isString(),
  body('vitals.bpUnit').optional().isIn(['mmHg']).withMessage('Invalid BP unit'),
  body('vitals.height').optional().trim().isString(),
  body('vitals.heightUnit').optional().isIn(['cm', 'ft', 'inch']).withMessage('Invalid height unit'),
  body('vitals.weight').optional().trim().isString(),
  body('vitals.weightUnit').optional().isIn(['kg', 'lb']).withMessage('Invalid weight unit'),
  body('vitals.bmi').optional().trim().isString(),
  body('vitals.bmiUnit').optional().isIn(['kg/m²']).withMessage('Invalid BMI unit'),
  body('vitals.abdominalExamination').optional().trim().isString(),

  // System Examinations
  // System Examinations
  body('cns').optional().isIn(['normal', 'abnormal', '']).withMessage('Invalid CNS value'),
  body('cnsDetails')
    .optional()
    .custom((value, { req }) => {
      if (req.body.cns === 'abnormal' && (!value || value.trim() === '')) {
        throw new Error('CNS details are required when CNS is abnormal');
      }
      return true;
    })
    .trim(),

  body('cvs').optional().isIn(['normal', 'abnormal', '']).withMessage('Invalid CVS value'),
  body('cvsDetails')
    .optional()
    .custom((value, { req }) => {
      if (req.body.cvs === 'abnormal' && (!value || value.trim() === '')) {
        throw new Error('CVS details are required when CVS is abnormal');
      }
      return true;
    })
    .trim(),

  body('respiratorySystem').optional().isIn(['normal', 'abnormal', '']).withMessage('Invalid respiratory system value'),
  body('respiratorySystemDetails')
    .optional()
    .custom((value, { req }) => {
      if (req.body.respiratorySystem === 'abnormal' && (!value || value.trim() === '')) {
        throw new Error('Respiratory system details are required when respiratory system is abnormal');
      }
      return true;
    })
    .trim(),

  body('git').optional().isIn(['normal', 'abnormal', '']).withMessage('Invalid GIT value'),
  body('gitDetails')
    .optional()
    .custom((value, { req }) => {
      if (req.body.git === 'abnormal' && (!value || value.trim() === '')) {
        throw new Error('GIT details are required when GIT is abnormal');
      }
      return true;
    })
    .trim(),
];