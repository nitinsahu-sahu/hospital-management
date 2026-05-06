
const Patient = require('../models/Patient.js');

// 🔥 Generate Patient ID
const generatePatientId = async () => {
  const count = await Patient.countDocuments();
  const id = `PAT${new Date().getFullYear()}${(count + 1)
    .toString()
    .padStart(4, "0")}`;
  return id;
};

// ✅ Create Patient
exports.createPatient = async (req, res) => {
  try {
    const patientId = await generatePatientId();

    // Convert dateOfBirth to Date object if it's a string
    const patientData = {
      ...req.body,
      patientId,
      dateOfBirth: new Date(req.body.dateOfBirth),
    };

    const patient = new Patient(patientData);
    await patient.save();

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      data: patient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get All Patients
exports.getPatients = async (req, res) => {
  try {
    // 📌 Query params
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    // 📊 Total documents
    const total = await Patient.countDocuments();

    // 📄 Paginated data
    const patients = await Patient.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: patients,
      pagination: {
        totalRecords: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
console.log(patient);
console.log(doctor);

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