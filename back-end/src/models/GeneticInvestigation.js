const mongoose = require('mongoose');

const geneticInvestigationItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['genetic'],
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

const geneticInvestigationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['genetic'],
    required: true
  },
  investigations: [geneticInvestigationItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
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

// Compound index for efficient queries
geneticInvestigationSchema.index({ patientId: 1, category: 1 });
geneticInvestigationSchema.index({ consultationId: 1 });
geneticInvestigationSchema.index({ date: -1 });

module.exports = mongoose.model('GeneticInvestigation', geneticInvestigationSchema);