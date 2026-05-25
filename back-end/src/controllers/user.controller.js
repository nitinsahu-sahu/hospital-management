
const User = require("../models/User");
const Relative = require("../models/Relative");
const generateUHID = require("../utils/generateUHID");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../utils/response");
const { calculateDuration, addDurations } = require("../utils/duration");

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

        const cookieExpiry = 2 * 60 * 60 * 1000; //2 hours
        res.cookie('token', token, {
            sameSite: process.env.PRODUCTION ? "none" : 'Lax',
            maxAge: cookieExpiry,
            httpOnly: true,
            secure: process.env.PRODUCTION ? true : false
        });
        return sendResponse(res, true, "Login successfully", {
            token,
            user,
            expiresIn: cookieExpiry
        }, 200);

    } catch (error) {
        return sendResponse(res, false, error.message, null, 500);
    }
};

// ======================= LOGOUT  =========================
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

        return sendResponse(res, true, "Logout successfully", null, 200);
    } catch (error) {
        return sendResponse(res, false, error.message, null, 500);
    }
};