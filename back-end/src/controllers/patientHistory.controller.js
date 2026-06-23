const PatientHistory = require('../models/PatientHistory');
const Consultation = require('../models/Cosultation');
const Patient = require('../models/User');

// Create Patient History
exports.createPatientHistory = async (req, res) => {
  try {
    const {
      patientId,
      consultationId,
      chiefComplaints,
      chiefComplaintsDetails,
      // amenorrhoea,
      // complaint,
      historyOfIllness,
      menstrualHistory,
      obstetricHistory,
      wifeMedicalHistory,
      husbandMedicalHistory
    } = req.body;

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if history already exists for this patient
    const existingHistory = await PatientHistory.findOne({ patientId });
    if (existingHistory) {
      return res.status(400).json({
        success: false,
        message: 'Patient history already exists. Please update instead.'
      });
    }

    if (historyOfIllness?.duration) {
      const isValidDuration = historyOfIllness.duration.every(item => {
        if (item.unit === '' || item.unit === null || item.unit === undefined) {
          return true;
        }
        return item.number && ['months', 'weeks', 'days', 'years'].includes(item.unit);
      });

      if (!isValidDuration) {
        return res.status(400).json({
          success: false,
          message: 'Invalid duration format. Each duration item must have a number and a valid unit (months/weeks/days/years)'
        });
      }
    }

    const patientHistory = new PatientHistory({
      patientId,
      consultationId,
      chiefComplaints,
      chiefComplaintsDetails,
      // amenorrhoea,
      // complaint,
      historyOfIllness: {
        onset: historyOfIllness?.onset,
        duration: historyOfIllness?.duration || [],
        associatedSymptoms: historyOfIllness?.associatedSymptoms
      },
      menstrualHistory: {
        cycleLength: menstrualHistory?.cycleLength,
        daysOfFlow: menstrualHistory?.daysOfFlow,
        associatedSymptoms: menstrualHistory?.associatedSymptoms,
        lmp: menstrualHistory?.lmp
      },
      obstetricHistory: {
        gravida: obstetricHistory?.gravida,
        para: obstetricHistory?.para,
        living: obstetricHistory?.living,
        abortion: obstetricHistory?.abortion,
        sb_iod_dead: obstetricHistory?.sb_iod_dead,
        ectopic: obstetricHistory?.ectopic
      },
      wifeMedicalHistory: {
        diabetes: wifeMedicalHistory?.diabetes,
        hypertension: wifeMedicalHistory?.hypertension,
        asthma: wifeMedicalHistory?.asthma,
        thyroid: wifeMedicalHistory?.thyroid,
        drugAllergy: wifeMedicalHistory?.drugAllergy,
        drugAllergyDetails: wifeMedicalHistory?.drugAllergyDetails,
        geneticDiseaseSelf: wifeMedicalHistory?.geneticDiseaseSelf,
        geneticDiseaseFamily: wifeMedicalHistory?.geneticDiseaseFamily,
        downSyndrome: wifeMedicalHistory?.downSyndrome,
        smoking: wifeMedicalHistory?.smoking,
        drugAddiction: wifeMedicalHistory?.drugAddiction
      },
      husbandMedicalHistory: {
        diabetes: husbandMedicalHistory?.diabetes,
        hypertension: husbandMedicalHistory?.hypertension,
        asthma: husbandMedicalHistory?.asthma,
        thyroid: husbandMedicalHistory?.thyroid,
        drugAllergy: husbandMedicalHistory?.drugAllergy,
        drugAllergyDetails: husbandMedicalHistory?.drugAllergyDetails,
        geneticDiseaseSelf: husbandMedicalHistory?.geneticDiseaseSelf,
        geneticDiseaseFamily: husbandMedicalHistory?.geneticDiseaseFamily,
        downSyndrome: husbandMedicalHistory?.downSyndrome,
        smoking: husbandMedicalHistory?.smoking,
        drugAddiction: husbandMedicalHistory?.drugAddiction
      },
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    await patientHistory.save();

    // If consultationId is provided, update the consultation with history reference
    if (consultationId) {
      await Consultation.findByIdAndUpdate(consultationId, {
        patientHistoryId: patientHistory._id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Patient history created successfully',
      data: patientHistory
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({
      success: false,
      message: 'Error creating patient history',
      error: error.message
    });
  }
};

// Update Patient History
exports.updatePatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      chiefComplaints,
      chiefComplaintsDetails,
      // amenorrhoea,
      // complaint,
      historyOfIllness,
      menstrualHistory,
      obstetricHistory,
      wifeMedicalHistory,
      husbandMedicalHistory,
      consultationId
    } = req.body;

    const updateData = {
      updatedBy: req.user.id
    };

    // Only update fields that are provided

    if (consultationId !== undefined) updateData.consultationId = consultationId;
    if (chiefComplaints !== undefined) updateData.chiefComplaints = chiefComplaints;
    if (chiefComplaintsDetails !== undefined) updateData.chiefComplaintsDetails = chiefComplaintsDetails;
    // if (amenorrhoea !== undefined) updateData.amenorrhoea = amenorrhoea;
    // if (complaint !== undefined) updateData.complaint = complaint;

    if (historyOfIllness) {
      updateData.historyOfIllness = {};
      if (historyOfIllness.onset) updateData.historyOfIllness.onset = historyOfIllness.onset;
      if (historyOfIllness.duration !== undefined) {
        // Validate duration format if provided and not empty
        if (historyOfIllness?.duration) {
          const isValidDuration = historyOfIllness.duration.every(item => {
            if (item.unit === '' || item.unit === null || item.unit === undefined) {
              return true;
            }
            return item.number && ['months', 'weeks', 'days', 'years'].includes(item.unit);
          });

          if (!isValidDuration) {
            return res.status(400).json({
              success: false,
              message: 'Invalid duration format. Each duration item must have a number and a valid unit (months/weeks/days/years)'
            });
          }
        }
        // if (Array.isArray(historyOfIllness.duration) && historyOfIllness.duration.length > 0) {
        //   const isValidDuration = historyOfIllness.duration.every(item =>
        //     item.number && item.unit && ['months', 'weeks', 'days', 'years',""].includes(item.unit)
        //   );
        //   if (!isValidDuration) {
        //     return res.status(400).json({
        //       success: false,
        //       message: 'Invalid duration format. Each duration item must have a number and a valid unit (months/weeks/days/years)'
        //     });
        //   }
        // }
        updateData.historyOfIllness.duration = historyOfIllness.duration;
      }
      if (historyOfIllness.associatedSymptoms) updateData.historyOfIllness.associatedSymptoms = historyOfIllness.associatedSymptoms;
    }

    if (menstrualHistory) {
      updateData.menstrualHistory = {};
      if (menstrualHistory.cycleLength) updateData.menstrualHistory.cycleLength = menstrualHistory.cycleLength;
      if (menstrualHistory.daysOfFlow) updateData.menstrualHistory.daysOfFlow = menstrualHistory.daysOfFlow;
      if (menstrualHistory.associatedSymptoms) updateData.menstrualHistory.associatedSymptoms = menstrualHistory.associatedSymptoms;
      if (menstrualHistory.lmp) updateData.menstrualHistory.lmp = menstrualHistory.lmp;
    }

    if (obstetricHistory) {
      updateData.obstetricHistory = {};
      if (obstetricHistory.gravida) updateData.obstetricHistory.gravida = obstetricHistory.gravida;
      if (obstetricHistory.para) updateData.obstetricHistory.para = obstetricHistory.para;
      if (obstetricHistory.living) updateData.obstetricHistory.living = obstetricHistory.living;
      if (obstetricHistory.abortion) updateData.obstetricHistory.abortion = obstetricHistory.abortion;
      if (obstetricHistory.ectopic) updateData.obstetricHistory.ectopic = obstetricHistory.ectopic;
      if (obstetricHistory.sb_iod_dead) updateData.obstetricHistory.sb_iod_dead = obstetricHistory.sb_iod_dead;
    }

    if (wifeMedicalHistory) {
      updateData.wifeMedicalHistory = {};
      Object.keys(wifeMedicalHistory).forEach(key => {
        if (wifeMedicalHistory[key] !== undefined) {
          updateData.wifeMedicalHistory[key] = wifeMedicalHistory[key];
        }
      });
    }

    if (husbandMedicalHistory) {
      updateData.husbandMedicalHistory = {};
      Object.keys(husbandMedicalHistory).forEach(key => {
        if (husbandMedicalHistory[key] !== undefined) {
          updateData.husbandMedicalHistory[key] = husbandMedicalHistory[key];
        }
      });
    }

    const patientHistory = await PatientHistory.findOneAndUpdate(
      { patientId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!patientHistory) {
      return res.status(404).json({
        success: false,
        message: 'Patient history not found'
      });
    }

    // If consultationId is provided, update the consultation
    if (consultationId) {
      await Consultation.findByIdAndUpdate(consultationId, {
        patientHistoryId: patientHistory._id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient history updated successfully',
      data: patientHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating patient history',
      error: error.message
    });
  }
};

// Get Patient History by Patient ID
exports.getPatientHistoryByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patientHistory = await PatientHistory.findOne({ patientId })
      .populate('patientId', 'name UHID age gender')
      .populate('consultationId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!patientHistory) {
      return res.status(404).json({
        success: false,
        message: 'Patient history not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patientHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patient history',
      error: error.message
    });
  }
};

// Delete Patient History
exports.deletePatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patientHistory = await PatientHistory.findOneAndDelete({ patientId });

    if (!patientHistory) {
      return res.status(404).json({
        success: false,
        message: 'Patient history not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient history deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting patient history:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting patient history',
      error: error.message
    });
  }
};

// Get All Patient Histories (with pagination and filters)
exports.getAllPatientHistories = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: order === 'desc' ? -1 : 1 },
      populate: [
        { path: 'patientId', select: 'name UHID age gender' },
        { path: 'createdBy', select: 'name email' },
        { path: 'updatedBy', select: 'name email' }
      ]
    };

    const patientHistories = await PatientHistory.paginate({}, options);

    res.status(200).json({
      success: true,
      data: patientHistories
    });
  } catch (error) {
    console.error('Error fetching patient histories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient histories',
      error: error.message
    });
  }
};