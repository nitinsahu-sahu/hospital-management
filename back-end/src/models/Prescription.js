const mongoose = require('mongoose');


const medicationSchema = new mongoose.Schema({
  drugName: {
    type: String,
    required: [true, "Drug name is required"],
    trim: true,
  },
  dosage: {
    type: String,
    required: [true, "Dosage is required"],
    trim: true,
  },
  frequency: {
    type: String,
    required: [true, "Frequency is required"],
    enum: [
      "Once Daily",
      "Twice Daily",
      "Thrice Daily",
      "Four Times Daily",
      "Every 4 Hours",
      "Every 6 Hours",
      "Every 8 Hours",
      "Every 12 Hours",
      "Once Weekly",
      "As Needed",
      "Before Meals",
      "After Meals",
      "At Bedtime",
    ],
  },
  duration: {
    type: String,
    required: [true, "Duration is required"],
    trim: true,
  },
  route: {
    type: String,
    required: [true, "Route is required"],
    enum: [
      "Oral",
      "Intravenous (IV)",
      "Intramuscular (IM)",
      "Subcutaneous (SC)",
      "Topical",
      "Sublingual",
      "Rectal",
      "Inhalation",
      "Ophthalmic",
      "Otic",
    ],
  },
  instructions: {
    type: String,
    trim: true,
  },
});

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient is required"],
    },
    medications: {
      type: [medicationSchema],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "At least one medication is required",
      },
    },
    specialInstructions: {
      type: String,
      trim: true,
    },
    followUpDate: {
      type: Date,
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
  },
  { timestamps: true }
);


module.exports = mongoose.model("Prescription", prescriptionSchema);