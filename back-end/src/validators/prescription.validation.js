// validators/prescription.validator.js
const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

// Create Prescription Validation
exports.createPrescriptionValidation = [
    // Patient ID validation
    body('patientId')
        .notEmpty()
        .withMessage('Patient ID is required')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid Patient ID format');
            }
            return true;
        }),

    // Medications validation
    body('medications')
        .isArray({ min: 1 })
        .withMessage('At least one medication is required')
        .custom((medications) => {
            if (!medications || medications.length === 0) {
                throw new Error('At least one medication is required');
            }
            
            // Validate each medication
            medications.forEach((med, index) => {
                const medNum = index + 1;
                
                if (!med.drugName || med.drugName.trim() === '') {
                    throw new Error(`Medication #${medNum}: Drug name is required`);
                }
                
                if (!med.dosage || med.dosage.trim() === '') {
                    throw new Error(`Medication #${medNum}: Dosage is required`);
                }
                
                if (!med.frequency || med.frequency.trim() === '') {
                    throw new Error(`Medication #${medNum}: Frequency is required`);
                }
                
                const validFrequencies = [
                    "Once Daily", "Twice Daily", "Thrice Daily", 
                    "Four Times Daily", "Every 4 Hours", "Every 6 Hours",
                    "Every 8 Hours", "Every 12 Hours", "Once Weekly",
                    "As Needed", "Before Meals", "After Meals", "At Bedtime"
                ];
                
                if (med.frequency && !validFrequencies.includes(med.frequency)) {
                    throw new Error(`Medication #${medNum}: Invalid frequency value`);
                }
                
                if (!med.duration || med.duration.trim() === '') {
                    throw new Error(`Medication #${medNum}: Duration is required`);
                }
                
                if (!med.route || med.route.trim() === '') {
                    throw new Error(`Medication #${medNum}: Route is required`);
                }
                
                const validRoutes = [
                    "Oral", "Intravenous (IV)", "Intramuscular (IM)",
                    "Subcutaneous (SC)", "Topical", "Sublingual",
                    "Rectal", "Inhalation", "Ophthalmic", "Otic"
                ];
                
                if (med.route && !validRoutes.includes(med.route)) {
                    throw new Error(`Medication #${medNum}: Invalid route value`);
                }
            });
            
            return true;
        }),

    // Optional fields
    body('specialInstructions')
        .optional()
        .trim()
        .isString()
        .withMessage('Special instructions must be a string')
        .isLength({ max: 1000 })
        .withMessage('Special instructions cannot exceed 1000 characters'),
];

// Update Prescription Validation
exports.updatePrescriptionValidation = [
    param('id')
        .notEmpty()
        .withMessage('Prescription ID is required')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid Prescription ID format');
            }
            return true;
        }),

    // Patient ID validation (optional for update)
    body('patientId')
        .optional()
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('Invalid Patient ID format');
            }
            return true;
        }),

    // Medications validation (optional for update)
    body('medications')
        .optional()
        .isArray({ min: 1 })
        .withMessage('At least one medication is required')
        .custom((medications) => {
            if (medications && medications.length > 0) {
                medications.forEach((med, index) => {
                    const medNum = index + 1;
                    
                    if (!med.drugName || med.drugName.trim() === '') {
                        throw new Error(`Medication #${medNum}: Drug name is required`);
                    }
                    
                    if (!med.dosage || med.dosage.trim() === '') {
                        throw new Error(`Medication #${medNum}: Dosage is required`);
                    }
                    
                    const validFrequencies = [
                        "Once Daily", "Twice Daily", "Thrice Daily", 
                        "Four Times Daily", "Every 4 Hours", "Every 6 Hours",
                        "Every 8 Hours", "Every 12 Hours", "Once Weekly",
                        "As Needed", "Before Meals", "After Meals", "At Bedtime"
                    ];
                    
                    if (med.frequency && !validFrequencies.includes(med.frequency)) {
                        throw new Error(`Medication #${medNum}: Invalid frequency value`);
                    }
                    
                    if (!med.duration || med.duration.trim() === '') {
                        throw new Error(`Medication #${medNum}: Duration is required`);
                    }
                    
                    const validRoutes = [
                        "Oral", "Intravenous (IV)", "Intramuscular (IM)",
                        "Subcutaneous (SC)", "Topical", "Sublingual",
                        "Rectal", "Inhalation", "Ophthalmic", "Otic"
                    ];
                    
                    if (med.route && !validRoutes.includes(med.route)) {
                        throw new Error(`Medication #${medNum}: Invalid route value`);
                    }
                });
            }
            return true;
        }),

    // Optional fields for update
    body('specialInstructions')
        .optional()
        .trim()
        .isString()
        .withMessage('Special instructions must be a string')
        .isLength({ max: 1000 })
        .withMessage('Special instructions cannot exceed 1000 characters'),
];