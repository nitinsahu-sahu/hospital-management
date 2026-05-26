const Relative = require("../models/Relative");
const User = require("../models/User.js");
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

    if (howToFindClinic && howToFindClinic.trim() !== "") {
      patientData.howToFindClinic = howToFindClinic;
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