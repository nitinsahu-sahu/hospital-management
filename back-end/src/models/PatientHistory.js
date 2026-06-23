// models/PatientHistory.js
const mongoose = require('mongoose');

const durationItemSchema = new mongoose.Schema({
  number: {
    type: String,
    required: false
  },
  unit: {
    type: String,
    enum: ['months', 'weeks', 'days', 'years', ''],
    required: false,
    default:""
  }
}, { _id: false });

const patientHistorySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: false
  },
  // Chief Complaints
  chiefComplaints: {
    type: String,
    required: false
  },
  chiefComplaintsDetails: {
    type: String,
    required: false
  },
  // Amenorrhoea
  // amenorrhoea: {
  //   type: String,
  //   required: false
  // },
  // Complaint
  // complaint: {
  //   type: String,
  //   required: false
  // },
  // History of Patient Illness
  historyOfIllness: {
    onset: {
      type: Date,
      required: false
    },
    duration: {
      type: [durationItemSchema], 
      required: false,
      default: []
    },
    associatedSymptoms: {
      type: String,
      required: false
    }
  },
  // Menstrual History
  menstrualHistory: {
    cycleLength: {
      type: String,
      required: false
    },
    daysOfFlow: {
      type: String,
      required: false
    },
    associatedSymptoms: {
      type: String,
      required: false
    },
    lmp: {
      type: Date,
      required: false
    }
  },
  // Obstetric History
  obstetricHistory: {
    gravida: {
      type: String,
      required: false
    },
    para: {
      type: String,
      required: false
    },
    living: {
      type: String,
      required: false
    },
    abortion: {
      type: String,
      required: false
    },
    sb_iod_dead: {
      type: String,
      required: false
    },
    ectopic: {
      type: String,
      required: false
    }
  },
  // Wife Medical History
  wifeMedicalHistory: {
    diabetes: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    hypertension: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    asthma: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    thyroid: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    drugAllergy: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    drugAllergyDetails: {
      type: String,
      required: false
    },
    geneticDiseaseSelf: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    geneticDiseaseFamily: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    downSyndrome: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    smoking: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    drugAddiction: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    }
  },
  // Husband History
  husbandMedicalHistory: {
    diabetes: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    hypertension: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    asthma: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    thyroid: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    drugAllergy: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    drugAllergyDetails: {
      type: String,
      required: false
    },
    geneticDiseaseSelf: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    geneticDiseaseFamily: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    downSyndrome: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    smoking: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    },
    drugAddiction: {
      type: String,
      enum: ['yes', 'no', ''],
      default: ''
    }
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

module.exports = mongoose.model('PatientHistory', patientHistorySchema);