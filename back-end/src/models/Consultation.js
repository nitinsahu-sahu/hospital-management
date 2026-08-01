const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  consultationDate: {
    type: Date,
    default: Date.now
  },
  doctorNotes: {
    type: String,
    default: ''
  },
  diagnosis: {
    type: String,
    default: ''
  },
  fees: {
    freeOfCost: {
      type: Number,
      default: 0
    },
    emergencyConsultationFee: {
      type: Number,
      default: 0
    },
    geneticConsultationFee: {
      type: Number,
      default: 0
    },
    opdConsultationFee: {
      type: Number,
      default: 0
    },
    additionalFees: [{
      name: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      addedAt: {
        type: Date,
        default: Date.now
      },
    }]
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
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

// Calculate total before saving
consultationSchema.pre('save', function() {
  let total = 0;
  total += this.fees.freeOfCost || 0;
  total += this.fees.emergencyConsultationFee || 0;
  total += this.fees.geneticConsultationFee || 0;
  total += this.fees.opdConsultationFee || 0;
  
  if (this.fees.additionalFees && this.fees.additionalFees.length > 0) {
    this.fees.additionalFees.forEach(fee => {
      total += fee.amount || 0;
    });
  }
  
  this.totalAmount = total;
});

module.exports = mongoose.model('Consultation', consultationSchema);