const { body, param } = require('express-validator');
const mongoose = require('mongoose');

// Blood Group Options
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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

    body('relativeExaminationDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format'),

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
    body('vitals.localExamination.perVaginalExamination').optional().trim().isString(),
    body('vitals.localExamination.perSpeculumExamination').optional().trim().isString(),

    // System Examinations
    body('cns')
        .optional()
        .isIn(['normal', 'abnormal', ''])
        .withMessage('CNS must be normal, abnormal, or empty'),
    body('cnsDetails')
        .if(body('cns').equals('abnormal'))
        .notEmpty()
        .withMessage('CNS details are required when status is abnormal')
        .trim()
        .isString(),

    body('cvs')
        .optional()
        .isIn(['normal', 'abnormal', ''])
        .withMessage('CVS must be normal, abnormal, or empty'),
    body('cvsDetails')
        .if(body('cvs').equals('abnormal'))
        .notEmpty()
        .withMessage('CVS details are required when status is abnormal')
        .trim()
        .isString(),

    body('respiratorySystem')
        .optional()
        .isIn(['normal', 'abnormal', ''])
        .withMessage('Respiratory system must be normal, abnormal, or empty'),
    body('respiratorySystemDetails')
        .if(body('respiratorySystem').equals('abnormal'))
        .notEmpty()
        .withMessage('Respiratory system details are required when status is abnormal')
        .trim()
        .isString(),

    body('git')
        .optional()
        .isIn(['normal', 'abnormal', ''])
        .withMessage('GIT must be normal, abnormal, or empty'),
    body('gitDetails')
        .if(body('git').equals('abnormal'))
        .notEmpty()
        .withMessage('GIT details are required when status is abnormal')
        .trim()
        .isString(),

    // Investigations
    body('investigations.hiv').optional().trim().isString(),
    body('investigations.hbsAg').optional().trim().isString(),
    body('investigations.vdrl').optional().trim().isString(),
    body('investigations.hcv').optional().trim().isString(),
    body('investigations.bloodGroup')
        .optional()
        .isIn([...BLOOD_GROUPS, ''])
        .withMessage('Invalid blood group'),
    body('investigations.tsh').optional().trim().isString(),
    body('investigations.rbs').optional().trim().isString(),
    body('investigations.thalassemiaScreen').optional().trim().isString(),
    body('investigations.karyotype').optional().trim().isString(),

    // Semen Analysis
    body('semenAnalysis.count').optional().trim().isString(),
    body('semenAnalysis.countUnit').optional().trim().isString(),
    body('semenAnalysis.morphology').optional().trim().isString(),
    body('semenAnalysis.motility').optional().trim().isString(),
    body('semenAnalysis.motilityUnit').optional().trim().isString(),
    body('semenAnalysis.hcv').optional().trim().isString(),
    body('semenAnalysis.remark').optional().trim().isString(),
    body('semenAnalysis.dfi').optional().trim().isString(),
    body('semenAnalysis.dfiUnit').optional().trim().isString(),
    body('semenAnalysis.srFsh').optional().trim().isString(),
    body('semenAnalysis.srTestosterone').optional().trim().isString(),
    body('semenAnalysis.e2').optional().trim().isString(),
    body('semenAnalysis.sProlactin').optional().trim().isString(),
    body('semenAnalysis.karyotype').optional().trim().isString(),
    body('semenAnalysis.yMicrosomeDeletion').optional().trim().isString(),
    body('semenAnalysis.trusScrotalUsg').optional().trim().isString(),
    body('semenAnalysis.testicularBiopsy').optional().trim().isString(),

    // Medical History
    body('medicalHistory.problem').optional().trim().isString(),
    body('medicalHistory.currentMedications').optional().trim().isString(),

    // Surgical History
    body('surgicalHistory').optional().isArray().withMessage('Surgical history must be an array'),
    body('surgicalHistory.*.surgery').optional().trim().isString(),
    body('surgicalHistory.*.year').optional().trim().isString(),
    body('surgicalHistory.*.detailsFinding').optional().trim().isString(),
];

// Update Relative Examination Validation
exports.updateRelativeExaminationValidation = [
    body('relativeExaminationDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format'),

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
    body('vitals.localExamination.perVaginalExamination').optional().trim().isString(),
    body('vitals.localExamination.perSpeculumExamination').optional().trim().isString(),

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
        .trim()
        .isString(),

    body('cvs').optional().isIn(['normal', 'abnormal', '']).withMessage('Invalid CVS value'),
    body('cvsDetails')
        .optional()
        .custom((value, { req }) => {
            if (req.body.cvs === 'abnormal' && (!value || value.trim() === '')) {
                throw new Error('CVS details are required when CVS is abnormal');
            }
            return true;
        })
        .trim()
        .isString(),

    body('respiratorySystem').optional().isIn(['normal', 'abnormal', '']).withMessage('Invalid respiratory system value'),
    body('respiratorySystemDetails')
        .optional()
        .custom((value, { req }) => {
            if (req.body.respiratorySystem === 'abnormal' && (!value || value.trim() === '')) {
                throw new Error('Respiratory system details are required when respiratory system is abnormal');
            }
            return true;
        })
        .trim()
        .isString(),

    body('git').optional().isIn(['normal', 'abnormal', '']).withMessage('Invalid GIT value'),
    body('gitDetails')
        .optional()
        .custom((value, { req }) => {
            if (req.body.git === 'abnormal' && (!value || value.trim() === '')) {
                throw new Error('GIT details are required when GIT is abnormal');
            }
            return true;
        })
        .trim()
        .isString(),

    // Investigations
    body('investigations.hiv').optional().trim().isString(),
    body('investigations.hbsAg').optional().trim().isString(),
    body('investigations.vdrl').optional().trim().isString(),
    body('investigations.hcv').optional().trim().isString(),
    body('investigations.bloodGroup')
        .optional()
        .isIn([...BLOOD_GROUPS, ''])
        .withMessage('Invalid blood group'),
    body('investigations.tsh').optional().trim().isString(),
    body('investigations.rbs').optional().trim().isString(),
    body('investigations.thalassemiaScreen').optional().trim().isString(),
    body('investigations.karyotype').optional().trim().isString(),

    // Semen Analysis
    body('semenAnalysis.count').optional().trim().isString(),
    body('semenAnalysis.countUnit').optional().trim().isString(),
    body('semenAnalysis.morphology').optional().trim().isString(),
    body('semenAnalysis.motility').optional().trim().isString(),
    body('semenAnalysis.motilityUnit').optional().trim().isString(),
    body('semenAnalysis.hcv').optional().trim().isString(),
    body('semenAnalysis.remark').optional().trim().isString(),
    body('semenAnalysis.dfi').optional().trim().isString(),
    body('semenAnalysis.dfiUnit').optional().trim().isString(),
    body('semenAnalysis.srFsh').optional().trim().isString(),
    body('semenAnalysis.srTestosterone').optional().trim().isString(),
    body('semenAnalysis.e2').optional().trim().isString(),
    body('semenAnalysis.sProlactin').optional().trim().isString(),
    body('semenAnalysis.karyotype').optional().trim().isString(),
    body('semenAnalysis.yMicrosomeDeletion').optional().trim().isString(),
    body('semenAnalysis.trusScrotalUsg').optional().trim().isString(),
    body('semenAnalysis.testicularBiopsy').optional().trim().isString(),

    // Medical History
    body('medicalHistory.problem').optional().trim().isString(),
    body('medicalHistory.currentMedications').optional().trim().isString(),

    // Surgical History
    body('surgicalHistory').optional().isArray().withMessage('Surgical history must be an array'),
    body('surgicalHistory.*.surgery').optional().trim().isString(),
    body('surgicalHistory.*.year').optional().trim().isString(),
    body('surgicalHistory.*.detailsFinding').optional().trim().isString(),
];