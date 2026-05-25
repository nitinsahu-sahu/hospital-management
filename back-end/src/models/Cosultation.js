const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
      }
    }]
  },
  totalAmount: {
    type: Number,
    default: 0
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
  total += this.fees.freeOfCost;
  total += this.fees.emergencyConsultationFee;
  total += this.fees.geneticConsultationFee;
  total += this.fees.opdConsultationFee;
  
  if (this.fees.additionalFees && this.fees.additionalFees.length > 0) {
    this.fees.additionalFees.forEach(fee => {
      total += fee.amount;
    });
  }
  
  this.totalAmount = total;
});

module.exports = mongoose.model('Consultation', consultationSchema);