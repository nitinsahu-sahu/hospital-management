
const User = require("../models/User");
const generateUHID = require("../utils/generateUHID");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../utils/response");
const { calculateDuration,addDurations } = require("../utils/duration");

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

        const existingPatient = await User.findOne({ mobileNumber });

        if (existingPatient) {
            return res.status(400).json({
                success: false,
                message: "Patient already exists",
            });
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
            howToFindClinic,
            referredByDoctorName,
            idProofType,
            idProofNumber,
            profilePic,
            UH_ID: generateUHID(),
        });

        res.status(201).json({
            success: true,
            message: "Patient created successfully",
            data: patient,
        });
    } catch (error) {
        return sendResponse(res, false, error.message, null, 500);
    }
};

// ================= CREATE DOCTOR =================

exports.createDoctor = async (req, res) => {
    try {
        const data = req.body;

        const existingDoctor = await User.findOne({
            mobileNumber: data.mobileNumber,
        });

        if (existingDoctor) {
            return sendResponse(res, false, "Doctor already exists", null, 400);
        }

        const doctor = await User.create({
            role: "doctor",
            ...data,
        });

        return sendResponse(res, true, "Doctor created successfully", doctor, 201);

    } catch (error) {
        return sendResponse(res, false, error.message, null, 500);

    }
};

// ================= CREATE EMPLOYEE =================

exports.createEmployee = async (req, res) => {
    try {
        const data = req.body;

        const existingEmployee = await User.findOne({
            mobileNumber: data.mobileNumber,
        });

        if (existingEmployee) {
        return sendResponse(res, false, "Employee already exists", null, 400);
        }

        const employee = await User.create({
            role: "employee",
            ...data,
        });

        return sendResponse(res, true, "Employee created successfully", employee, 201);
       
    } catch (error) {
        return sendResponse(res, false, error.message, null, 500);

    }
};

// ================= LOGIN =================

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return sendResponse(res, false, "User not found", null, 404);
        }

        if (user.role !== "doctor" && user.role !== "employee") {
            return sendResponse(res, false, "Only doctor and employee can login", null, 403);
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return sendResponse(res, false, "Invalid credentials", null, 400);
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE || "7d",
            }
        );

        return sendResponse(res, true, "Login successfully", { token, user,expiresIn:process.env.JWT_EXPIRE }, 200);

    } catch (error) {
        return sendResponse(res, false, error.message, null, 500);
    }
};

// ================= GET ALL PATIENTS =================

exports.getAllPatients = async (req, res) => {
    try {
        const patients = await User.find({
            role: "patient",
        }).sort({ createdAt: -1 });

        return sendResponse(res, true, "Get patient successfully.", {patients,count: patients.length}, 200);

    } catch (error) {
        return sendResponse(res, false, error.message, null, 500);

    }
};

exports.logout = async (req, res) => {
    try {
        // Track session duration before logging out
        if (req.user) {
            const user = await User.findById(req.user._id);
            if (user && user.lastLoginTime) {
                const now = new Date();
                const today = now.toISOString().split('T')[0];
                const sessionDuration = calculateDuration(user.lastLoginTime, now);

                // Update stats (same as in middleware)
                if (!user.sessionStats.today || user.sessionStats.today.date !== today) {
                    user.sessionStats.today = {
                        date: today,
                        duration: { hours: 0, minutes: 0, seconds: 0 }
                    };
                }
                user.sessionStats.today.duration = addDurations(
                    user.sessionStats.today.duration,
                    sessionDuration
                );

                user.sessionStats.totalDuration = addDurations(
                    user.sessionStats.totalDuration || { hours: 0, minutes: 0, seconds: 0 },
                    sessionDuration
                );

                const existingDayIndex = user.sessionStats.history.findIndex(
                    entry => entry.date === today
                );

                if (existingDayIndex >= 0) {
                    user.sessionStats.history[existingDayIndex].duration = addDurations(
                        user.sessionStats.history[existingDayIndex].duration,
                        sessionDuration
                    );
                } else {
                    user.sessionStats.history.push({
                        date: today,
                        duration: sessionDuration
                    });
                }

                user.lastLoginTime = null;
                await user.save();
            }
        }

        // Clear the token cookie
        res.clearCookie('token', {
            sameSite: process.env.PRODUCTION === 'true' ? "None" : 'Lax',
            httpOnly: true,
            secure: process.env.PRODUCTION === 'true' ? true : false
        });

        return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error while logging out, please try again later" });
    }
};