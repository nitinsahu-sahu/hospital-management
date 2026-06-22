const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["doctor", "patient", "employee"],
            required: true,
        },

        // ================= COMMON FIELDS =================
        name: {
            type: String,
            required: true,
            trim: true,
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

        // ================= LOGIN FIELDS =================
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        password: {
            type: String,
            minlength: 6,
        },

        // ================= PATIENT FIELDS =================
        UH_ID: {
            type: String,
            sparse: true,
        },
        age: {
            type: Number,
        },

        sex: {
            type: String,
            enum: ["male", "female", "other"],
            default: "female"
        },
        sexDetails: {
            type: String,
            required: false
        },
        maritalStatus: {
            type: String,
            enum: ["single", "married", "divorced", "widowed", "other"],
            default: "married"
        },
        maritalStatusDetails: {
            type: String,
            required: false
        },
        durationOfMarriage: {
            type: String,
        },

        howToFindClinic: {
            type: String,
            enum: [
                "google",
                "justdial",
                "instagram",
                "facebook",
                "friend",
                "relative",
                "doctor",
                "newspaper",
                "youtube",
                "other",
            ],
            default: "google"
        },
        howToFindClinicDetails: {
            type: String,
            required: false
        },
        referredByDoctorName: {
            type: String,
            trim: true,
        },

        idProofType: {
            type: String,
            enum: [
                "aadhaar",
                "pancard",
                "passport",
                "driving_license",
                "voter",
                "other",
            ],
            default: "aadhaar"
        },
        idProofTypeDetails: {
            type: String,
            required: false
        },
        infertiliyType: {
            type: String,
            enum: [
                "primary",
                "secondary",
                "other",
            ],
            default: "primary"
        },
        infertiliyTypeDetails: {
            type: String,
            required: false
        },
        idProofNumber: {
            type: String,
            validate: {
                validator: function (value) {
                    // Skip validation if type is 'other'
                    if (this.idProofType === 'other') {
                        return value && value.length >= 3 && value.length <= 50;
                    }

                    // Validate based on type
                    switch (this.idProofType) {
                        case 'aadhaar':
                            return /^\d{12}$/.test(value);
                        case 'pancard':
                            return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
                        case 'passport':
                            return /^[A-Z]{1}[0-9]{7}$/.test(value);
                        case 'driving_license':
                            return /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(value);
                        case 'voter':
                            return /^[A-Z]{3}[0-9]{7}$/.test(value);
                        default:
                            return true;
                    }
                },
                message: 'Invalid ID proof number format for the selected ID type'
            }
        },

        // ================= DOCTOR FIELDS =================
        specialization: {
            type: String,
        },

        qualification: {
            type: String,
        },

        experience: {
            type: Number,
        },

        registrationNumber: {
            type: String,
        },

        department: {
            type: String,
        },

        // ================= EMPLOYEE FIELDS =================
        employeeId: {
            type: String,
        },

        designation: {
            type: String,
        },

        joiningDate: {
            type: Date,
        },

        salary: {
            type: Number,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
    },
    {
        timestamps: true,
    }
);

// Password Hash
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

// Password Compare
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);