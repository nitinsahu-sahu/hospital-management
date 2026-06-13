const mongoose = require('mongoose');

const procedureSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    default: null
  },
  procedures: [{
    procedureId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      enum: ['iui', 'cvs', 'prp', 'lbc', 'amniocentesis'],
      required: true
    },
    subType: {
      type: String,
      enum: ['self', 'donor', 'husband', null],
      default: null
    },
    description: {
      type: String,
      default: ''
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  procedureDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
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

// Index for faster queries
procedureSchema.index({ patientId: 1, procedureDate: -1 });
procedureSchema.index({ consultationId: 1 });

module.exports = mongoose.model('Procedure', procedureSchema);