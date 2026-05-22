const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const relativeSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["cousin", "husband"],
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        age: {
            type: Number,
        },

        sex: {
            type: String,
            enum: ["male", "female", "other"],
        },

        mobileNumber: {
            type: String,
            required: true,
            unique: true,
        },

        profilePic: {
            url: String,
            public_id: String,
            alt: String,
        },

        address: {
            type: String,
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        maritalStatus: {
            type: String,
            enum: ["single", "married", "divorced", "widowed"],
        },

        idProofType: {
            type: String,
            enum: [
                "aadhaar",
                "pan_card",
                "passport",
                "driving_license",
            ],
        },

        idProofNumber: {
            type: String,
        },

        UH_ID: {
            type: String,
            unique: true,
        },
        
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Relative", relativeSchema);