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
    }
}, { _id: false });

const husbandExaminationSchema = new mongoose.Schema({
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
        required: false
    },
    cvs: {
        type: String,
        enum: ['normal', 'abnormal', ''],
        default: ''
    },
    cvsDetails: {
        type: String,
        required: false
    },
    respiratorySystem: {
        type: String,
        enum: ['normal', 'abnormal', ''],
        default: ''
    },
    respiratorySystemDetails: {
        type: String,
        required: false
    },
    git: {
        type: String,
        enum: ['normal', 'abnormal', ''],
        default: ''
    },
    gitDetails: {
        type: String,
        required: false
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

module.exports = mongoose.model('RelativeExamination', husbandExaminationSchema);