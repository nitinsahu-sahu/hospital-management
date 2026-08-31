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

// Rubella Schema
const rubellaSchema = new mongoose.Schema({
    igg: {
        type: String,
        default: ''
    },
    igm: {
        type: String,
        default: ''
    },
    amh: {
        type: String,
        default: ''
    },
    avidityTest: {
        type: String,
        default: ''
    }
}, { _id: false });

// HSG Schema
const hsgSchema = new mongoose.Schema({
    year: {
        type: String,
        default: ''
    },
    finding: {
        type: String,
        default: ''
    }
}, { _id: false });

// Investigations Schema
const investigationsSchema = new mongoose.Schema({
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
        default: ''
    },
    hiv: {
        type: String,
        default: ''
    },
    tsh: {
        type: String,
        default: ''
    },
    hbsAg: {
        type: String,
        default: ''
    },
    rbs: {
        type: String,
        default: ''
    },
    hcv: {
        type: String,
        default: ''
    },
    prl: {
        type: String,
        default: ''
    },
    vdrl: {
        type: String,
        default: ''
    },
    sgot: {
        type: String,
        default: ''
    },
    dtah: {
        type: String,
        default: ''
    },
    sgpt: {
        type: String,
        default: ''
    },
    bun: {
        type: String,
        default: ''
    },
    srCreatinine: {
        type: String,
        default: ''
    },
    rubella: {
        type: rubellaSchema,
        default: () => ({})
    },
    thalassemiaScreen: {
        type: String,
        default: ''
    },
    papTest: {
        type: String,
        default: ''
    },
    karyotype: {
        type: String,
        default: ''
    },
    hsg: {
        type: hsgSchema,
        default: () => ({})
    },
    echocardiography: {
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

const patientExaminationSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    patientExaminationDate: {
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

module.exports = mongoose.model('PatientExamination', patientExaminationSchema);