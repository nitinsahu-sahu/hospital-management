// controllers/patientExamination.controller.js
const PatientExamination = require('../models/PatientExamination');
const Patient = require('../models/User');
const Consultation = require('../models/Cosultation');

// Create Patient Examination
exports.createPatientExamination = async (req, res) => {
  try {
    const {
      patientId,
      consultationId,
      vitals,
      cns,
      cnsDetails,
      cvs,
      cvsDetails,
      respiratorySystem,
      respiratorySystemDetails,
      git,
      gitDetails
    } = req.body;

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if examination already exists for this patient
    const existingExamination = await PatientExamination.findOne({ patientId });
    if (existingExamination) {
      return res.status(400).json({
        success: false,
        message: 'Patient examination already exists. Please update instead.'
      });
    }

    const examination = new PatientExamination({
      patientId,
      consultationId,
      vitals: {
        pr: vitals?.pr || '',
        prUnit: vitals?.prUnit || 'bpm',
        bp: vitals?.bp || '',
        bpUnit: vitals?.bpUnit || 'mmHg',
        height: vitals?.height || '',
        heightUnit: vitals?.heightUnit || 'cm',
        weight: vitals?.weight || '',
        weightUnit: vitals?.weightUnit || 'kg',
        bmi: vitals?.bmi || '',
        bmiUnit: vitals?.bmiUnit || 'kg/m²',
        abdominalExamination: vitals?.abdominalExamination || '',
        localExamination: {
          perVaginalExamination: vitals?.localExamination?.perVaginalExamination || '',
          perSpeculumExamination: vitals?.localExamination?.perSpeculumExamination || ''
        }
      },
      cns: cns || '',
      cnsDetails: cns === 'abnormal' ? cnsDetails || '' : '',
      cvs: cvs || '',
      cvsDetails: cvs === 'abnormal' ? cvsDetails || '' : '',
      respiratorySystem: respiratorySystem || '',
      respiratorySystemDetails: respiratorySystem === 'abnormal' ? respiratorySystemDetails || '' : '',
      git: git || '',
      gitDetails: git === 'abnormal' ? gitDetails || '' : '',
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    await examination.save();

    // If consultationId is provided, update the consultation with examination reference
    if (consultationId) {
      await Consultation.findByIdAndUpdate(consultationId, {
        patientExaminationId: examination._id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Patient examination created successfully',
      data: examination
    });
  } catch (error) {
    console.error('Error creating patient examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating patient examination',
      error: error.message
    });
  }
};

// Get Patient Examination by Patient ID
exports.getPatientExaminationByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    const examination = await PatientExamination.findOne({ patientId })
      .populate('patientId', 'name UH_ID mobileNumber sex age')
      .populate('consultationId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: 'Patient examination not found'
      });
    }

    res.status(200).json({
      success: true,
      data: examination
    });
  } catch (error) {
    console.error('Error fetching patient examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient examination',
      error: error.message
    });
  }
};

// Get Patient Examination by ID
exports.getPatientExaminationById = async (req, res) => {
  try {
    const { id } = req.params;

    const examination = await PatientExamination.findById(id)
      .populate('patientId', 'name UH_ID mobileNumber sex age')
      .populate('consultationId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: 'Patient examination not found'
      });
    }

    res.status(200).json({
      success: true,
      data: examination
    });
  } catch (error) {
    console.error('Error fetching patient examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient examination',
      error: error.message
    });
  }
};

// Update Patient Examination
exports.updatePatientExamination = async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      vitals,
      cns,
      cnsDetails,
      cvs,
      cvsDetails,
      respiratorySystem,
      respiratorySystemDetails,
      git,
      gitDetails
    } = req.body;

    // Find existing examination
    const existingExamination = await PatientExamination.findOne({ patientId });

    if (!existingExamination) {
      return res.status(404).json({
        success: false,
        message: 'Patient examination not found'
      });
    }

    // Build update object
    const updateData = {
      updatedBy: req.user.id
    };

    // Update vitals if provided
    if (vitals) {
      updateData.vitals = {};
      const vitalsFields = ['pr', 'prUnit', 'bp', 'bpUnit', 'height', 'heightUnit', 
        'weight', 'weightUnit', 'bmi', 'bmiUnit', 'abdominalExamination'];
      
      vitalsFields.forEach(field => {
        if (vitals[field] !== undefined) {
          updateData.vitals[field] = vitals[field];
        }
      });

      // Handle local examination
      if (vitals.localExamination) {
        updateData.vitals.localExamination = {};
        if (vitals.localExamination.perVaginalExamination !== undefined) {
          updateData.vitals.localExamination.perVaginalExamination = 
            vitals.localExamination.perVaginalExamination;
        }
        if (vitals.localExamination.perSpeculumExamination !== undefined) {
          updateData.vitals.localExamination.perSpeculumExamination = 
            vitals.localExamination.perSpeculumExamination;
        }
      }
    }

    // Update CNS
    if (cns !== undefined) {
      updateData.cns = cns;
      updateData.cnsDetails = cns === 'abnormal' ? (cnsDetails || '') : '';
    } else if (cnsDetails !== undefined && existingExamination.cns === 'abnormal') {
      updateData.cnsDetails = cnsDetails;
    }

    // Update CVS
    if (cvs !== undefined) {
      updateData.cvs = cvs;
      updateData.cvsDetails = cvs === 'abnormal' ? (cvsDetails || '') : '';
    } else if (cvsDetails !== undefined && existingExamination.cvs === 'abnormal') {
      updateData.cvsDetails = cvsDetails;
    }

    // Update Respiratory System
    if (respiratorySystem !== undefined) {
      updateData.respiratorySystem = respiratorySystem;
      updateData.respiratorySystemDetails = respiratorySystem === 'abnormal' ? (respiratorySystemDetails || '') : '';
    } else if (respiratorySystemDetails !== undefined && existingExamination.respiratorySystem === 'abnormal') {
      updateData.respiratorySystemDetails = respiratorySystemDetails;
    }

    // Update GIT
    if (git !== undefined) {
      updateData.git = git;
      updateData.gitDetails = git === 'abnormal' ? (gitDetails || '') : '';
    } else if (gitDetails !== undefined && existingExamination.git === 'abnormal') {
      updateData.gitDetails = gitDetails;
    }

    const updatedExamination = await PatientExamination.findOneAndUpdate(
      { patientId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Patient examination updated successfully',
      data: updatedExamination
    });
  } catch (error) {
    console.error('Error updating patient examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating patient examination',
      error: error.message
    });
  }
};

// Delete Patient Examination
exports.deletePatientExamination = async (req, res) => {
  try {
    const { id } = req.params;

    const examination = await PatientExamination.findByIdAndDelete(id);

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: 'Patient examination not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient examination deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting patient examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting patient examination',
      error: error.message
    });
  }
};