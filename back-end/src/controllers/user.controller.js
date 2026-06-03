
const User = require("../models/User");
const Relative = require("../models/Relative");
const generateUHID = require("../utils/generateUHID");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../utils/response");
const { calculateDuration, addDurations } = require("../utils/duration");
const cloudinaryService = require("../services/cloudinary.service");

// ================= CREATE DOCTOR =================
exports.createDoctor = async (req, res) => {
    console.log(req.body);
    
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

        const user = await User.findOne({ email })

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

//======================== Pic Update======================
exports.userPicUpdate = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if file is provided
        if (!req.files || req.files.length === 0) {
            return sendResponse(res, false, "Please provide a profile picture", null, 400);
        }

        // Find the user
        const user = await User.findById(userId);

        if (!user) {
            return sendResponse(res, false, "User not found", null, 404);
        }

        // Delete old profile picture from Cloudinary if it exists
        if (user.pic && user.pic.public_id) {
            try {
                await cloudinaryService.deleteImage(user.pic.public_id);
                console.log(`Old profile picture deleted successfully: ${user.pic.public_id}`);
            } catch (deleteError) {
                console.error("Failed to delete old profile picture:", deleteError.message);
                // Continue even if delete fails - don't block the upload
            }
        }

        // Upload new picture to Cloudinary
        const file = req.files[0];
        let uploadResult;
        
        try {
            uploadResult = await cloudinaryService.uploadImage(file.buffer, {
                folder: "pic",
                public_id: `pic_${userId}_${Date.now()}`,
            });
        } catch (uploadError) {
            console.error("Failed to upload image to Cloudinary:", uploadError.message);
            return sendResponse(res, false, "Failed to upload image to cloud storage", null, 500);
        }

        // Prepare new picture data
        const picData = {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            alt: `${user.name || 'User'} profile picture`,
        };

        // Update user with new picture data
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    pic: picData,
                    updatedBy: userId
                } 
            },
            { 
                new: true,  // This still works but you can use returnDocument: 'after' to avoid deprecation warning
                select: '-password' // Exclude password from response
            }
        );

        if (!updatedUser) {
            // If user update fails, delete the newly uploaded image
            await cloudinaryService.deleteImage(uploadResult.public_id).catch(err => {
                console.error("Failed to cleanup after failed update:", err.message);
            });
            return sendResponse(res, false, "Failed to update user profile picture", null, 500);
        }

        return sendResponse(
            res,
            true,
            "Profile picture updated successfully",
            { 
                user: updatedUser
            },
            200
        );

    } catch (error) {
        console.error("Error updating profile picture:", error);
        return sendResponse(res, false, error.message || "Internal server error", null, 500);
    }
};