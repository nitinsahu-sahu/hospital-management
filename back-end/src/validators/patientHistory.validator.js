const { body, param } = require('express-validator');
const mongoose = require('mongoose');

exports.createPatientHistoryValidation = [
    body('wifeMedicalHistory.drugAllergy').optional().isIn(['yes', 'no', '']).withMessage('Invalid Drug Allergy value'),
    body('wifeMedicalHistory.drugAllergyDetails')
        .optional()
        .custom((value, { req }) => {
            if (req.body.wifeMedicalHistory.drugAllergy === 'yes' && (!value || value.trim() === '')) {
                throw new Error('Drug allergy details are required when it`s yes');
            }
            return true;
        })
        .trim(),

    body('husbandMedicalHistory.drugAllergy').optional().isIn(['yes', 'no', '']).withMessage('Invalid Drug Allergy value'),
    body('husbandMedicalHistory.drugAllergyDetails')
        .optional()
        .custom((value, { req }) => {
            if (req.body.husbandMedicalHistory.drugAllergy === 'yes' && (!value || value.trim() === '')) {
                throw new Error('Husband drug allergy details are required when it`s yes');
            }
            return true;
        })
        .trim(),
];

// Update Patient Examination Validation
exports.updatePatientHistoryValidation = [
    body('wifeMedicalHistory.drugAllergy').optional().isIn(['yes', 'no', '']).withMessage('Invalid Drug Allergy value'),
    body('wifeMedicalHistory.drugAllergyDetails')
        .optional()
        .custom((value, { req }) => {
            if (req.body.wifeMedicalHistory.drugAllergy === 'yes' && (!value || value.trim() === '')) {
                throw new Error('Drug allergy details are required when it`s yes');
            }
            return true;
        })
        .trim(),

    body('husbandMedicalHistory.drugAllergy').optional().isIn(['yes', 'no', '']).withMessage('Invalid Drug Allergy value'),
    body('husbandMedicalHistory.drugAllergyDetails')
        .optional()
        .custom((value, { req }) => {
            if (req.body.husbandMedicalHistory.drugAllergy === 'yes' && (!value || value.trim() === '')) {
                throw new Error('Husband drug allergy details are required when it`s yes');
            }
            return true;
        })
        .trim(),
];