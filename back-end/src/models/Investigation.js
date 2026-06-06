const mongoose = require('mongoose');

const investigationItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['pndt', 'gynae', 'pelvic'],
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

const investigationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true
  },
  category: String,
  subCategory: String,
  investigations: [investigationItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
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

// Index for faster queries
investigationSchema.index({ patientId: 1 });
investigationSchema.index({ consultationId: 1 });
investigationSchema.index({ date: -1 });

module.exports = mongoose.model('Investigation', investigationSchema);