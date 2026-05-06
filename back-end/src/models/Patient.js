const mongoose = require('mongoose');


const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value < new Date(); // Ensure DOB is in the past
        },
        message: 'Date of birth must be in the past'
      }
    },

    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Divorced", "Widowed", "Other"],
      required: true,
    },

    mobile: {
      type: String,
      required: true,
    },

    city: {
      type: String,
    },

    department: {
      type: String,
      required: true,
    },

    doctor: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["OPD", "IPD"],
      default: "OPD",
    },

    emergencyName: String,
    emergencyMobile: String,

    symptoms: String,

    fee: Number,

    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Card"],
      default: "Cash",
    },

    role: {
      type: String,
      enum: ['admin', 'doctor', 'patient'],
      default: "patient",
    },

    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Paid",
    },

    referredBy: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Virtual field to calculate age
patientSchema.virtual('age').get(function () {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
  return null;
});

// Ensure virtuals are included in JSON output
patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);
