const Relative = require("../models/Relative");
const User = require("../models/User.js");
const mongoose = require("mongoose");
const generateUHID = require("../utils/generateUHID.js");
const { sendResponse } = require("../utils/response.js");
const cloudinaryService = require("../services/cloudinary.service.js");


// ================= CREATE PATIENT =================
exports.createPatient = async (req, res) => {
  try {
    const {
      name,
      age,
      sex,
      sexDetails,
      mobileNumber,
      address,
      maritalStatus,
      durationOfMarriage,
      howToFindClinic,
      referredByDoctorName,
      idProofType,
      idProofNumber,
      infertiliyType
    } = req.body;


    const existingPatient = await User.findOne({ mobileNumber });
    if (existingPatient) {
      return sendResponse(res, false, "Patient already exists", null, 400);
    }

    // if (howToFindClinic && howToFindClinic.trim() !== "") {
    //   patientData.howToFindClinic = howToFindClinic;
    // }

    let pic = {};

    if (req.files && req.files.length > 0) {
      const file = req.files[0];

      const result = await cloudinaryService.uploadImage(file.buffer, {
        folder: "pic",
        public_id: `pic_${Date.now()}`,
        publicIdPrefix: `${Date.now()}`
      });

      pic = {
        url: result.secure_url,
        public_id: result.public_id,
        alt: `${name} - ${Date.now()}`,
      };
    }

    const patient = await User.create({
      role: "patient",
      name,
      age,
      infertiliyType,
      sex,
      sexDetails,
      mobileNumber,
      address,
      maritalStatus,
      durationOfMarriage,
      howToFindClinic,
      referredByDoctorName,
      idProofType,
      idProofNumber,
      pic,
      createdBy: req.user.id,
      UH_ID: await generateUHID(),
    });

    return sendResponse(res, true, "Patient created successfully", patient, 201);

  } catch (error) {
    return sendResponse(res, false, error.message, null, 500);
  }
};

// ================= CREATE RELATIVE=================
exports.createRelative = async (req, res) => {
  try {
    const {
      name,
      age,
      sex,
      sexDetails,
      mobileNumber,
      address,
      email,
      maritalStatus,
      idProofType,
      idProofNumber,
      role,
      UH_ID
    } = req.body;

    const existingPatient = await Relative.findOne({ mobileNumber });

    if (existingPatient) {
      return sendResponse(res, false, "Patient already exists", null, 400);
    }

    let pic = {};

    if (req.files && req.files.length > 0) {
      const file = req.files[0];

      const result = await cloudinaryService.uploadImage(file.buffer, {
        folder: "pic",
        public_id: `pic_${Date.now()}`,
        publicIdPrefix: `${Date.now()}`

      });

      pic = {
        url: result.secure_url,
        public_id: result.public_id,
        alt: `${name} - ${Date.now()}`,
      };
    }

    const patient = await Relative.create({
      role,
      name,
      age,
      email,
      sexDetails,
      sex,
      mobileNumber,
      address,
      maritalStatus,
      idProofType,
      idProofNumber,
      pic,
      UH_ID
    });

    return sendResponse(res, true, "Registration successfully", patient, 201);

  } catch (error) {
    console.log(error);

    return sendResponse(res, false, error.message, null, 500);
  }
};

// ✅ Get All Patients with their Relatives
exports.getPatients = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      includeRelatives = true,
      search = "",
      gender,
      age,
      fromDate,
      toDate,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // 🧠 Dynamic filter object
    let filter = { role: "patient" };

    // 🔎 SEARCH (name, phone, UH_ID, email etc.)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobileNumber: { $regex: search, $options: "i" } },
        { UH_ID: { $regex: search, $options: "i" } }
      ];
    }

    // 🚻 Gender filter
    if (gender) {
      filter.gender = gender;
    }

    // 🎂 Age filter (if stored in DB)
    if (age) {
      filter.age = parseInt(age);
    }

    // 📅 Date range filter (createdAt)
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    // 📊 Total count
    const total = await User.countDocuments(filter);

    // 📄 Patients query
    const patients = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 👥 Relatives optional
    if (includeRelatives === "true" || includeRelatives === true) {
      const patientsWithRelatives = await Promise.all(
        patients.map(async (patient) => {
          const relatives = await Relative.find({
            UH_ID: patient.UH_ID,
          }).lean();

          return {
            ...patient,
            relatives,
            relativesCount: relatives.length,
          };
        })
      );

      return sendResponse(
        res,
        true,
        "Get patients with filters successfully",
        {
          patients: patientsWithRelatives,
          pagination: {
            totalRecords: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            limit,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
        },
        200
      );
    }

    // without relatives
    return sendResponse(
      res,
      true,
      "Get patients successfully",
      {
        patients,
        pagination: {
          totalRecords: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
      200
    );
  } catch (error) {
    return sendResponse(res, false, error.message, null, 500);
  }
};

// ================= GET PATIENT BY ID =================
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find patient by ID
    const patient = await User.findOne({
      _id: id,
      role: "patient"
    }).populate('createdBy', 'name email');

    if (!patient) {
      return sendResponse(res, false, "Patient not found", null, 404);
    }

    // Get all relatives for this patient
    const relatives = await Relative.find({
      UH_ID: patient.UH_ID
    }).lean();

    const patientWithRelatives = {
      ...patient.toObject(),
      relatives,
      relativesCount: relatives.length
    };

    return sendResponse(
      res,
      true,
      "Patient fetched successfully",
      patientWithRelatives,
      200
    );

  } catch (error) {
    return sendResponse(res, false, error.message, null, 500);
  }
};

// ================= UPDATE PATIENT =================
exports.updatePatient = async (req, res) => {

  try {
    const { id } = req.params;
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
      infertiliyType,
      isActive,
      relative  // Get relative data from request body
    } = req.body;

    // Find existing patient
    const existingPatient = await User.findOne({
      _id: id,
      role: "patient"
    });

    if (!existingPatient) {
      return sendResponse(res, false, "Patient not found", null, 404);
    }

    // Check if mobile number is being changed and if it's already taken
    if (mobileNumber && mobileNumber !== existingPatient.mobileNumber) {
      const mobileExists = await User.findOne({
        mobileNumber,
        _id: { $ne: id }
      });
      if (mobileExists) {
        return sendResponse(res, false, "Mobile number already exists", null, 400);
      }
    }

    // Prepare update data for patient
    const updateData = {
      updatedBy: req.user.id
    };

    // Only add fields that are provided
    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = age;
    if (sex !== undefined) updateData.sex = sex;
    if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber;
    if (address !== undefined) updateData.address = address;
    if (maritalStatus !== undefined) updateData.maritalStatus = maritalStatus;
    if (durationOfMarriage !== undefined) updateData.durationOfMarriage = durationOfMarriage;
    if (howToFindClinic !== undefined) updateData.howToFindClinic = howToFindClinic;
    if (referredByDoctorName !== undefined) updateData.referredByDoctorName = referredByDoctorName;
    if (idProofType !== undefined) updateData.idProofType = idProofType;
    if (idProofNumber !== undefined) updateData.idProofNumber = idProofNumber;
    if (infertiliyType !== undefined) updateData.infertiliyType = infertiliyType;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle profile picture update
    if (req.files && req.files.length > 0) {
      // Delete old image from cloudinary if exists
      if (existingPatient.pic && existingPatient.pic.public_id) {
        await cloudinaryService.deleteImage(existingPatient.pic.public_id);
      }

      const file = req.files[0];
      const result = await cloudinaryService.uploadImage(file.buffer, {
        folder: "pic",
        public_id: `pic_${Date.now()}`,
        publicIdPrefix: `${Date.now()}`
      });

      updateData.pic = {
        url: result.secure_url,
        public_id: result.public_id,
        alt: `${name || existingPatient.name} - ${Date.now()}`,
      };
    }

    // Update patient
    const updatedPatient = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Handle Relative Update/Create/Delete
    if (relative !== undefined) {
      // Check if relative exists for this patient
      const existingRelative = await Relative.findOne({
        UH_ID: existingPatient.UH_ID
      });

      if (relative === null || Object.keys(relative).length === 0) {
        // If relative is null or empty, delete existing relative if any
        if (existingRelative) {
          await Relative.findByIdAndDelete(existingRelative._id);
        }
      } else {
        // Prepare relative data
        const relativeData = {
          role: relative.role,
          name: relative.name,
          age: relative.age,
          sex: relative.sex,
          mobileNumber: relative.mobileNumber,
          address: relative.address,
          maritalStatus: relative.maritalStatus,
          idProofType: relative.idProofType,
          idProofNumber: relative.idProofNumber,
          UH_ID: existingPatient.UH_ID,
          isActive: relative.isActive !== undefined ? relative.isActive : true,
        };

        // Check if mobile number is being changed and if it's already taken by another relative
        if (existingRelative && relative.mobileNumber !== existingRelative.mobileNumber) {
          const mobileExists = await Relative.findOne({
            mobileNumber: relative.mobileNumber,
            _id: { $ne: existingRelative._id }
          });
          if (mobileExists) {
            // Rollback patient update? Or just return error
            return sendResponse(res, false, "Relative mobile number already exists", null, 400);
          }
        } else if (!existingRelative) {
          const mobileExists = await Relative.findOne({
            mobileNumber: relative.mobileNumber
          });
          if (mobileExists) {
            return sendResponse(res, false, "Relative mobile number already exists", null, 400);
          }
        }

        if (existingRelative) {
          // Update existing relative
          await Relative.findByIdAndUpdate(
            existingRelative._id,
            { $set: relativeData },
            { new: true, runValidators: true }
          );
        } else {
          // Create new relative
          await Relative.create(relativeData);
        }
      }
    }

    // Get updated relatives (single relative)
    const updatedRelatives = await Relative.find({
      UH_ID: updatedPatient.UH_ID
    }).lean();

    const patientWithRelatives = {
      ...updatedPatient.toObject(),
      relative: updatedRelatives.length > 0 ? updatedRelatives[0] : null,
      hasRelative: updatedRelatives.length > 0,
    };

    return sendResponse(
      res,
      true,
      "Patient updated successfully",
      patientWithRelatives,
      200
    );

  } catch (error) {
    console.log(error);
    return sendResponse(res, false, error.message, null, 500);
  }
};

// ================= DELETE PATIENT =================
exports.deletePatient = async (req, res) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // Find the patient
    const patient = await User.findOne({
      _id: id,
      role: "patient"
    }).session(session);

    if (!patient) {
      await session.abortTransaction();
      return sendResponse(res, false, "Patient not found", null, 404);
    }

    // Find all relatives
    const relatives = await Relative.find({
      UH_ID: patient.UH_ID
    }).session(session);

    // Delete patient's profile picture from cloudinary
    if (patient.pic && patient.pic.public_id) {
      await cloudinaryService.deleteImage(patient.pic.public_id);
    }

    // Delete relatives' profile pictures from cloudinary
    for (const relative of relatives) {
      if (relative.pic && relative.pic.public_id) {
        await cloudinaryService.deleteImage(relative.pic.public_id);
      }
    }

    // Delete relatives from database
    const deletedRelatives = await Relative.deleteMany(
      { UH_ID: patient.UH_ID }
    ).session(session);

    // Delete patient from database
    await User.findByIdAndDelete(id).session(session);

    // Commit the transaction
    await session.commitTransaction();

    console.log(`Deleted patient ${patient.name} (${patient.UH_ID}) and ${deletedRelatives.deletedCount} relative(s)`);

    return sendResponse(
      res,
      true,
      `Patient and ${deletedRelatives.deletedCount} relative(s) deleted successfully`,
      {
        patient: {
          _id: patient._id,
          name: patient.name,
          UH_ID: patient.UH_ID
        },
        deletedRelativesCount: deletedRelatives.deletedCount
      },
      200
    );

  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    console.error("Delete patient error:", error);
    return sendResponse(res, false, error.message, null, 500);
  } finally {
    // End session
    session.endSession();
  }
};

// ================= GET ALL PATIENTS (Existing) =================
exports.getPatients = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      includeRelatives = true,
      search = "",
      gender,
      age,
      fromDate,
      toDate,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Dynamic filter object
    let filter = { role: "patient" };

    // SEARCH (name, phone, UH_ID, email etc.)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobileNumber: { $regex: search, $options: "i" } },
        { UH_ID: { $regex: search, $options: "i" } }
      ];
    }

    // Gender filter
    if (gender) {
      filter.sex = gender;
    }

    // Age filter
    if (age) {
      filter.age = parseInt(age);
    }

    // Date range filter (createdAt)
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    // Total count
    const total = await User.countDocuments(filter);

    // Patients query
    const patients = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Relatives optional
    if (includeRelatives === "true" || includeRelatives === true) {
      const patientsWithRelatives = await Promise.all(
        patients.map(async (patient) => {
          const relatives = await Relative.find({
            UH_ID: patient.UH_ID,
          }).lean();

          // Return single relative object instead of array
          // If multiple relatives exist (edge case), return the first one
          return {
            ...patient,
            relative: relatives.length > 0 ? relatives[0] : null,
            hasRelative: relatives.length > 0,
          };
        })
      );

      return sendResponse(
        res,
        true,
        "Get patients with filters successfully",
        {
          patients: patientsWithRelatives,
          pagination: {
            totalRecords: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            limit,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
        },
        200
      );
    }

    // without relatives
    return sendResponse(
      res,
      true,
      "Get patients successfully",
      {
        patients: patients.map(patient => ({
          ...patient,
          relative: null,
          hasRelative: false,
        })),
        pagination: {
          totalRecords: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
      200
    );
  } catch (error) {
    return sendResponse(res, false, error.message, null, 500);
  }
};