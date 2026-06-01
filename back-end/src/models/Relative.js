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
sexDetails: {
            type: String,
            required: false
        },
        mobileNumber: {
            type: String,
            required: true,
            unique: true,
        },

        pic: {
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
            default:"married"
        },

        idProofType: {
            type: String,
            enum: [
                "aadhaar",
                "pancard",
                "passport",
                "driving_license",
                "voter",
            ],
            default:"aadhaar"
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