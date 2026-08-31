const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema({
    pr: {
        type: String,
        default: ''
    },
    prUnit: {
        type: String,
        default: 'bpm'
    },
    bp: {
        type: String,
        default: ''
    },
    bpUnit: {
        type: String,
        default: 'mmHg'
    },
    height: {
        type: String,
        default: ''
    },
    heightUnit: {
        type: String,
        default: 'cm'
    },
    weight: {
        type: String,
        default: ''
    },
    weightUnit: {
        type: String,
        default: 'kg'
    },
    bmi: {
        type: String,
        default: ''
    },
    bmiUnit: {
        type: String,
        default: 'kg/m²'
    },
    abdominalExamination: {
        type: String,
        default: ''
    },
    localExamination: {
        perVaginalExamination: {
            type: String,
            default: ''
        },
        perSpeculumExamination: {
            type: String,
            default: ''
        }
    }
}, { _id: false });

// Investigations Schema for Husband
const investigationsSchema = new mongoose.Schema({
    hiv: {
        type: String,
        default: ''
    },
    hbsAg: {
        type: String,
        default: ''
    },
    vdrl: {
        type: String,
        default: ''
    },
    hcv: {
        type: String,
        default: ''
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
        default: ''
    },
    tsh: {
        type: String,
        default: ''
    },
    rbs: {
        type: String,
        default: ''
    },
    thalassemiaScreen: {
        type: String,
        default: ''
    },
    karyotype: {
        type: String,
        default: ''
    }
}, { _id: false });

// Semen Analysis Schema
const semenAnalysisSchema = new mongoose.Schema({
    count: {
        type: String,
        default: ''
    },
    countUnit: {
        type: String,
        default: 'mil/ml'
    },
    morphology: {
        type: String,
        default: ''
    },
    motility: {
        type: String,
        default: ''
    },
    motilityUnit: {
        type: String,
        default: '%'
    },
    hcv: {
        type: String,
        default: ''
    },
    remark: {
        type: String,
        default: ''
    },
    dfi: {
        type: String,
        default: ''
    },
    dfiUnit: {
        type: String,
        default: '%'
    },
    srFsh: {
        type: String,
        default: ''
    },
    srTestosterone: {
        type: String,
        default: ''
    },
    e2: {
        type: String,
        default: ''
    },
    sProlactin: {
        type: String,
        default: ''
    },
    karyotype: {
        type: String,
        default: ''
    },
    yMicrosomeDeletion: {
        type: String,
        default: ''
    },
    trusScrotalUsg: {
        type: String,
        default: ''
    },
    testicularBiopsy: {
        type: String,
        default: ''
    }
}, { _id: false });

// Medical History Schema
const medicalHistorySchema = new mongoose.Schema({
    problem: {
        type: String,
        default: ''
    },
    currentMedications: {
        type: String,
        default: ''
    }
}, { _id: false });

// Surgical History Item Schema
const surgicalHistoryItemSchema = new mongoose.Schema({
    surgery: {
        type: String,
        default: ''
    },
    year: {
        type: String,
        default: ''
    },
    detailsFinding: {
        type: String,
        default: ''
    }
}, { _id: false });

const relativeExaminationSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    relativeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Relative',
        required: true,
    },
    relativeExaminationDate: {
        type: Date,
        default: Date.now
    },
    vitals: {
        type: vitalsSchema,
        default: () => ({})
    },
    cns: {
        type: String,
        enum: ['normal', 'abnormal', ''],
        default: ''
    },
    cnsDetails: {
        type: String,
        default: ''
    },
    cvs: {
        type: String,
        enum: ['normal', 'abnormal', ''],
        default: ''
    },
    cvsDetails: {
        type: String,
        default: ''
    },
    respiratorySystem: {
        type: String,
        enum: ['normal', 'abnormal', ''],
        default: ''
    },
    respiratorySystemDetails: {
        type: String,
        default: ''
    },
    git: {
        type: String,
        enum: ['normal', 'abnormal', ''],
        default: ''
    },
    gitDetails: {
        type: String,
        default: ''
    },
    investigations: {
        type: investigationsSchema,
        default: () => ({})
    },
    semenAnalysis: {
        type: semenAnalysisSchema,
        default: () => ({})
    },
    medicalHistory: {
        type: medicalHistorySchema,
        default: () => ({})
    },
    surgicalHistory: {
        type: [surgicalHistoryItemSchema],
        default: []
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RelativeExamination', relativeExaminationSchema);