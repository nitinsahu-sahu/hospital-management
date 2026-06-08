const mongoose = require('mongoose');

const bloodInvestigationItemSchema = new mongoose.Schema({
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
    enum: ['routine'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  selected: {
    type: Boolean,
    default: true
  }
});

const bloodInvestigationSchema = new mongoose.Schema({
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
  category: {
    type: String,
    enum: ['routine'],
    required: true
  },
  investigations: [bloodInvestigationItemSchema],
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
bloodInvestigationSchema.index({ patientId: 1, category: 1 });
bloodInvestigationSchema.index({ consultationId: 1 });
bloodInvestigationSchema.index({ date: -1 });

module.exports = mongoose.model('BloodInvestigation', bloodInvestigationSchema);