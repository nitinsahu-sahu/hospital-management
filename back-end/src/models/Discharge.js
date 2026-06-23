// models/Discharge.js
const mongoose = require('mongoose');

const dischargeSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true
  },
  dischargeDate: {
    type: Date,
    default: Date.now
  },
  finalDiagnosis: {
    type: String,
    required: true
  },
  treatmentSummary: {
    type: String,
    required: true
  },
  dischargeAdvice: {
    type: String,
    required: true
  },
  followUpDate: {
    type: Date
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

dischargeSchema.index({ patientId: 1, consultationId: 1 });

module.exports = mongoose.model('Discharge', dischargeSchema);