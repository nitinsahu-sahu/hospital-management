const RelativeExamination = require('../models/RelativeExamination');
const Patient = require('../models/User');
const Relative = require('../models/Relative');
const Consultation = require('../models/Consultation');

// Create Relative Examination
exports.createRelativeExamination = async (req, res) => {

  try {
    const {
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
    const { patientId, relativeId } = req.params
    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if relative exists
    const relative = await Relative.findById(relativeId);
    if (!relative) {
      return res.status(404).json({
        success: false,
        message: 'Relative not found'
      });
    }

    // Check if relative belongs to this patient
    if (relative.UH_ID !== patient.UH_ID) {
      return res.status(400).json({
        success: false,
        message: 'Relative does not belong to this patient'
      });
    }

    // Check if examination already exists for this relative
    const existingExamination = await RelativeExamination.findOne({ relativeId });
    if (existingExamination) {
      return res.status(400).json({
        success: false,
        message: 'Relative examination already exists. Please update instead.'
      });
    }

    const examination = new RelativeExamination({
      patientId,
      relativeId,
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
        abdominalExamination: vitals?.abdominalExamination || ''
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
        relativeExaminationId: examination._id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Relative examination created successfully',
      data: examination
    });
  } catch (error) {
    console.error('Error creating relative examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating relative examination',
      error: error.message
    });
  }
};

// Get Relative Examination by Patient ID
exports.getRelativeExaminationByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    const examinations = await RelativeExamination.find({ patientId })
      .populate('patientId', 'name UH_ID mobileNumber sex age')
      .populate('relativeId', 'name role mobileNumber sex')
      .populate('consultationId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!examinations || examinations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No relative examinations found for this patient'
      });
    }

    res.status(200).json({
      success: true,
      count: examinations.length,
      data: examinations
    });
  } catch (error) {
    console.error('Error fetching relative examinations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching relative examinations',
      error: error.message
    });
  }
};

// Get Relative Examination by Relative ID
exports.getRelativeExaminationByRelativeId = async (req, res) => {
  try {
    const { relativeId } = req.params;

    const examination = await RelativeExamination.findOne({ relativeId })
      .populate('patientId', 'name UH_ID mobileNumber sex age')
      .populate('relativeId', 'name role mobileNumber sex')
      .populate('consultationId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: 'Relative examination not found'
      });
    }

    res.status(200).json({
      success: true,
      data: examination
    });
  } catch (error) {
    console.error('Error fetching relative examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching relative examination',
      error: error.message
    });
  }
};

// Get Relative Examination by ID
exports.getRelativeExaminationById = async (req, res) => {
  try {
    const { id } = req.params;

    const examination = await RelativeExamination.findById(id)
      .populate('patientId', 'name UH_ID mobileNumber sex age')
      .populate('relativeId', 'name role mobileNumber sex')
      .populate('consultationId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: 'Relative examination not found'
      });
    }

    res.status(200).json({
      success: true,
      data: examination
    });
  } catch (error) {
    console.error('Error fetching relative examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching relative examination',
      error: error.message
    });
  }
};

// Update Relative Examination
exports.updateRelativeExamination = async (req, res) => {
  try {
    const { relativeId } = req.params;
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
    const existingExamination = await RelativeExamination.findOne({ relativeId });

    if (!existingExamination) {
      return res.status(404).json({
        success: false,
        message: 'Relative examination not found'
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

    const updatedExamination = await RelativeExamination.findOneAndUpdate(
      { relativeId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Relative examination updated successfully',
      data: updatedExamination
    });
  } catch (error) {
    console.error('Error updating relative examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating relative examination',
      error: error.message
    });
  }
};

// Delete Relative Examination
exports.deleteRelativeExamination = async (req, res) => {
  try {
    const { id } = req.params;

    const examination = await RelativeExamination.findByIdAndDelete(id);

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: 'Relative examination not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Relative examination deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting relative examination:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting relative examination',
      error: error.message
    });
  }
};