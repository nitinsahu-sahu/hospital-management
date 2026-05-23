const Relative = require("../models/Relative");
const User = require("../models/User.js");
const generateUHID = require("../utils/generateUHID.js");
const { sendResponse } = require("../utils/response.js");

// ================= CREATE RELATIVE=================

exports.createRelative = async (req, res) => {
  try {
    const {
      name,
      age,
      sex,
      mobileNumber,
      address,
      email,
      maritalStatus,
      idProofType,
      idProofNumber,
      profilePic,
      role,
      UH_ID
    } = req.body;

    const existingPatient = await Relative.findOne({ mobileNumber });

    if (existingPatient) {
      return sendResponse(res, false, "Patient already exists", null, 400);
    }

    const patient = await Relative.create({
      role,
      name,
      age,
      email,
      sex,
      mobileNumber,
      address,
      maritalStatus,
      idProofType,
      idProofNumber,
      profilePic,
      UH_ID
    });

    return sendResponse(res, true, "Registration successfully", patient, 201);

  } catch (error) {
    return sendResponse(res, false, error.message, null, 500);
  }
};

// ================= CREATE PATIENT =================

exports.createPatient = async (req, res) => {
  try {
    const {
      name,
      age,
      sex,
      mobileNumber,
      address,
      maritalStatus,
      durationOfMarriage,
      howToFindClinic,
      referredByDoctorName,
      idProofType,
      idProofNumber,
      profilePic,
      infertiliyType
    } = req.body;

    // const existingPatient = await User.findOne({ mobileNumber,email });
    const existingPatient = await User.findOne({ mobileNumber });
    if (existingPatient) {
      return sendResponse(res, false, "Patient already exists", null, 400);
    }

    if (howToFindClinic && howToFindClinic.trim() !== "") {
      patientData.howToFindClinic = howToFindClinic;
    }
    const patient = await User.create({
      role: "patient",
      name,
      age,
      infertiliyType,
      sex,
      mobileNumber,
      address,
      maritalStatus,
      durationOfMarriage,
      // howToFindClinic,
      referredByDoctorName,
      idProofType,
      idProofNumber,
      profilePic,
      createdBy: req.user.id,
      UH_ID: await generateUHID(),
    });

    return sendResponse(res, true, "Patient created successfully", patient, 201);

  } catch (error) {
    return sendResponse(res, false, error.message, null, 500);
  }
};

// ✅ Get All Patients
exports.getPatients = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    // 📊 Total documents
    const total = await User.countDocuments();

    // 📄 Paginated data
    const patients = await User.find({role:"patient"})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendResponse(res, true, "Get patient successfully", {
      patients,
      pagination: {
        totalRecords: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    }, 200);
  } catch (error) {
    return sendResponse(res, false, error.message, null, 500);
  }
};

// ✅ Get Single Patient
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Patient
exports.updatePatient = async (req, res) => {
  try {
    // If dateOfBirth is being updated, convert it to Date object
    const updateData = { ...req.body };
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({
      success: true,
      message: "Patient updated successfully",
      data: patient,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Patient
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get role Patient
// ✅ Get role wise (Doctor or Patient)
// ✅ Get both Patient and Doctor data from same Patient collection
exports.getRoleWise = async (req, res) => {
  try {
    // Ek hi ID se patient role wala data lo
    const patient = await Patient.find({ role: "patient" });

    // Usi ID se doctor role wala data lo
    const doctor = await Patient.find({ role: "doctor" });

    // Agar dono hi nahi mile
    if (!patient && !doctor) {
      return res.status(404).json({
        message: "No user found with this ID as patient or doctor"
      });
    }

    // Dono objects alag-alag bhejo
    res.json({
      success: true,
      patient: patient || null,   // Patient role wala object (ya null)
      doctor: doctor || null,     // Doctor role wala object (ya null)
    });

  } catch (error) {
    console.log(error.message);

    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Patient Statistics by Marital Status
exports.getPatientStatsByMaritalStatus = async (req, res) => {
  try {
    const stats = await Patient.aggregate([
      {
        $group: {
          _id: "$maritalStatus",
          count: { $sum: 1 },
          averageAge: { $avg: "$age" }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};