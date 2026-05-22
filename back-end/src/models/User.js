const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["doctor", "patient", "employee", "cousin", "husband"],
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

        profilePic: {
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
            unique: true,
            sparse: true,
        },
        age: {
            type: Number,
        },

        sex: {
            type: String,
            enum: ["male", "female", "other"],
        },

        maritalStatus: {
            type: String,
            enum: ["single", "married", "divorced", "widowed","other"],
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
        },

        referredByDoctorName: {
            type: String,
            trim: true,
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

        infertiliyType: {
            type: String,
            enum: [
                "primary",
                "secondary",
            ],
        },

        idProofNumber: {
            type: String,
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