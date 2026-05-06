const Patient = require('../models/Patient.js');
const Prescription = require('../models/Prescription.js');

// ✅ Create Prescription
exports.createPrescription = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      diagnosis,
      symptoms,
      medications,
      specialInstructions,
      followUpDate,
      status,
      notes,
    } = req.body;

    // Validate patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }
    const doctor = await Patient.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Validate medications array
    if (!medications || medications.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one medication is required",
      });
    }

    const prescription = new Prescription({
      patientId,
      doctorId,
      diagnosis,
      symptoms,
      medications,
      specialInstructions,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      status: status || "active",
      notes,
    });

    await prescription.save();

    // Populate patient details
    await prescription.populate("patientId", "name patientId mobile gender age");

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get All Prescriptions
exports.getPrescriptions = async (req, res) => {
  try {
    let { page = 1, limit = 10, status, patientId, doctorId, search } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (patientId) filter.patientId = patientId;
    if (doctorId) filter.doctorId = doctorId;
    
    // Search by prescriptionId or diagnosis
    if (search) {
      filter.$or = [
        { prescriptionId: { $regex: search, $options: 'i' } },
        { diagnosis: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Prescription.countDocuments(filter);

    const prescriptions = await Prescription.find(filter)
      .populate("patientId", "name patientId mobile gender age")
      .populate("doctorId", "name patientId mobile")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: prescriptions,
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

// ✅ Get Single Prescription
exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("patientId", "name patientId mobile gender age bloodGroup email city")
      .populate("doctorId", "name patientId mobile");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    res.json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get Prescriptions by Patient
exports.getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    let { page = 1, limit = 10, status } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const filter = { patientId };
    if (status) filter.status = status;

    const total = await Prescription.countDocuments(filter);

    const prescriptions = await Prescription.find(filter)
      .populate("patientId", "name patientId mobile")
      .populate("doctorId", "name patientId mobile")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: prescriptions,
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

// ✅ Get Prescriptions by Doctor
exports.getPrescriptionsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    let { page = 1, limit = 10, status } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const filter = { doctorId };
    if (status) filter.status = status;

    const total = await Prescription.countDocuments(filter);

    const prescriptions = await Prescription.find(filter)
      .populate("patientId", "name patientId mobile gender age")
      .populate("doctorId", "name patientId mobile")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: prescriptions,
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

// ✅ Update Prescription
exports.updatePrescription = async (req, res) => {
  try {
    const { patientId, doctorId, followUpDate, medications, ...updateData } = req.body;

    // If patientId is provided, validate
    if (patientId) {
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }
      updateData.patientId = patientId;
    }

    // If doctorId is provided, validate
    if (doctorId) {
      const doctor = await Patient.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }
      updateData.doctorId = doctorId;
    }

    // Convert followUpDate if provided
    if (followUpDate) {
      updateData.followUpDate = new Date(followUpDate);
    }

    // If medications provided, validate
    if (medications) {
      if (!Array.isArray(medications) || medications.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one medication is required",
        });
      }
      updateData.medications = medications;
    }

    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("patientId", "name patientId mobile gender age")
      .populate("doctorId", "name patientId mobile");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    res.json({
      success: true,
      message: "Prescription updated successfully",
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Update Prescription Status
exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !["active", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: active, completed, or cancelled",
      });
    }

    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("patientId", "name patientId mobile")
      .populate("doctorId", "name patientId mobile");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    res.json({
      success: true,
      message: `Prescription status updated to ${status}`,
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Delete Prescription
exports.deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndDelete(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    res.json({
      success: true,
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get Prescription Statistics
exports.getPrescriptionStats = async (req, res) => {
  try {
    const stats = await Prescription.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalPrescriptions = await Prescription.countDocuments();
    const todayPrescriptions = await Prescription.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    res.json({
      success: true,
      data: {
        totalPrescriptions,
        todayPrescriptions,
        stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};