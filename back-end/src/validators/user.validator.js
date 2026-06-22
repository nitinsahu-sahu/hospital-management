const { body } = require("express-validator");
const Joi = require("joi");


// ================= COMMON JOI =================

const mobileSchema = Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required();

const emailSchema = Joi.string()
    .email()
    .required();


// ================= ID PROOF VALIDATORS =================

// Aadhaar: 12 digits (XXXXXXXXXXXX)
const aadhaarSchema = Joi.string()
    .pattern(/^\d{12}$/)
    .required()
    .messages({
        'string.pattern.base': 'Aadhaar number must be exactly 12 digits'
    });

// PAN Card: 10 characters (AAAAA0000A)
const panCardSchema = Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .required()
    .messages({
        'string.pattern.base': 'PAN card number must be in format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)'
    });

// Passport: 8 characters (Letter + 7 digits or 8 characters)
const passportSchema = Joi.string()
    .pattern(/^[A-Z]{1}[0-9]{7}$/)
    .required()
    .messages({
        'string.pattern.base': 'Passport number must start with a letter followed by 7 digits (e.g., A1234567)'
    });

// Driving License: State code + RTO code + Year + Number (format varies by state)
const drivingLicenseSchema = Joi.string()
    .pattern(/^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/)
    .required()
    .messages({
        'string.pattern.base': 'Driving License must be in format: 2 letters, 2 digits (RTO), 4 digits (year), 7 digits (e.g., MH0120201234567)'
    });

// Voter ID: 10 characters (3 letters + 7 digits)
const voterIdSchema = Joi.string()
    .pattern(/^[A-Z]{3}[0-9]{7}$/)
    .required()
    .messages({
        'string.pattern.base': 'Voter ID must be exactly 3 letters followed by 7 digits (e.g., ABC1234567)'
    });

// Generic ID proof validation function
const validateIdProof = (type, value) => {
    switch (type) {
        case 'aadhaar':
            const aadhaarResult = aadhaarSchema.validate(value);
            if (aadhaarResult.error) {
                throw new Error(aadhaarResult.error.message);
            }
            // Additional Aadhaar validation (Verhoeff algorithm - optional)
            if (!validateAadhaarChecksum(value)) {
                throw new Error('Invalid Aadhaar number (checksum failed)');
            }
            break;

        case 'pancard':
            const panResult = panCardSchema.validate(value);
            if (panResult.error) {
                throw new Error(panResult.error.message);
            }
            // Additional PAN validation
            if (!validatePANFormat(value)) {
                throw new Error('Invalid PAN card format');
            }
            break;

        case 'passport':
            const passportResult = passportSchema.validate(value);
            if (passportResult.error) {
                throw new Error(passportResult.error.message);
            }
            break;

        case 'driving_license':
            const dlResult = drivingLicenseSchema.validate(value);
            if (dlResult.error) {
                throw new Error(dlResult.error.message);
            }
            break;

        case 'voter':
            const voterResult = voterIdSchema.validate(value);
            if (voterResult.error) {
                throw new Error(voterResult.error.message);
            }
            break;

        case 'other':
            // For other ID proofs, just check if it's not empty and reasonable length
            if (!value || value.trim().length < 3 || value.trim().length > 50) {
                throw new Error('ID proof number must be between 3 and 50 characters');
            }
            break;

        default:
            throw new Error('Invalid ID proof type');
    }
    return true;
};

// Verhoeff Algorithm for Aadhaar validation (optional but recommended)
function validateAadhaarChecksum(aadhaarNumber) {
    // Basic Aadhaar validation
    // First digit should not be 0 or 1
    if (aadhaarNumber.startsWith('0') || aadhaarNumber.startsWith('1')) {
        return false;
    }
    
    // Verhoeff algorithm implementation
    const d = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
        [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
        [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
        [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
        [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
        [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
        [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
        [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    ];
    
    const p = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
        [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
        [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
        [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
        [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
        [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
        [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
    ];
    
    let c = 0;
    const reversed = aadhaarNumber.split('').reverse().join('');
    
    for (let i = 0; i < reversed.length; i++) {
        c = d[c][p[(i % 8)][parseInt(reversed[i])]];
    }
    
    return c === 0;
}

// PAN Card format validation
function validatePANFormat(panNumber) {
    // PAN structure: 
    // 1-5: Alphabets
    // 6-9: Numbers
    // 10: Alphabet
    // 4th character represents status (P for Individual, C for Company, etc.)
    
    const validFourthChars = ['A', 'B', 'C', 'F', 'G', 'H', 'L', 'J', 'P', 'T', 'E'];
    const fourthChar = panNumber.charAt(3);
    
    if (!validFourthChars.includes(fourthChar)) {
        return false;
    }
    
    // First three characters should be alphabets
    for (let i = 0; i < 3; i++) {
        if (!/[A-Z]/.test(panNumber[i])) {
            return false;
        }
    }
    
    return true;
}

// ================= CUSTOM VALIDATOR FOR ID PROOF =================

const idProofValidator = (value, { req }) => {
    const idProofType = req.body.idProofType;
    
    if (!idProofType) {
        throw new Error('ID proof type is required to validate ID proof number');
    }
    
    return validateIdProof(idProofType, value);
};

// ================= CREATE PATIENT =================

exports.createPatientValidation = [
    body("name")
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2 })
        .withMessage("Name must be at least 2 characters"),

    body("sex")
        .notEmpty()
        .withMessage("Sex is required")
        .isIn(["male", "female", "other"])
        .withMessage("Invalid sex value"),

    body("sexDetails")
        .if(body("sex").equals("other"))
        .notEmpty()
        .withMessage("Sex details is required when sex is 'other'")
        .isLength({ min: 2 })
        .withMessage("Sex details must be at least 2 characters"),

    body("age")
        .notEmpty()
        .withMessage("Age is required")
        .isInt({ min: 1, max: 120 })
        .withMessage("Age must be between 1 to 120"),

    body("mobileNumber")
        .custom((value) => {
            const { error } = mobileSchema.validate(value);
            if (error) {
                throw new Error("Invalid mobile number");
            }
            return true;
        }),

    body("idProofType")
        .notEmpty()
        .withMessage("ID proof type is required")
        .isIn([
            "aadhaar",
            "pancard",
            "passport",
            "driving_license",
            "voter",
            "other", 
        ])
        .withMessage("Invalid ID proof type"),

    body("idProofTypeDetails")
        .if(body("idProofType").equals("other"))
        .notEmpty()
        .withMessage("ID proof type details is required when ID proof type is 'other'")
        .isLength({ min: 2 })
        .withMessage("ID proof type details must be at least 2 characters"),

    body("idProofNumber")
        .notEmpty()
        .withMessage("ID proof number is required")
        .custom(idProofValidator),

    body("maritalStatus")
        .optional()
        .isIn(["single", "married", "divorced", "widowed", "other"])
        .withMessage("Invalid marital status"),

    body("maritalStatusDetails")
        .if(body("maritalStatus").equals("other"))
        .notEmpty()
        .withMessage("Marital status details is required when marital status is 'other'")
        .isLength({ min: 2 })
        .withMessage("Marital status details must be at least 2 characters"),

    body("howToFindClinic")
        .optional()
        .isIn([
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
        ])
        .withMessage("Invalid source"),

    body("howToFindClinicDetails")
        .if(body("howToFindClinic").equals("other"))
        .notEmpty()
        .withMessage("Source details is required when source is 'other'")
        .isLength({ min: 2 })
        .withMessage("Source details must be at least 2 characters"),

    body("infertiliyType")
        .optional()
        .isIn(["primary", "secondary", "other"])
        .withMessage("Invalid infertility type"),

    body("infertiliyTypeDetails")
        .if(body("infertiliyType").equals("other"))
        .notEmpty()
        .withMessage("Infertility type details is required when infertility type is 'other'")
        .isLength({ min: 2 })
        .withMessage("Infertility type details must be at least 2 characters"),
];

// ================= UPDATE PATIENT VALIDATION =================

exports.updatePatientValidation = [
    body("name")
        .optional()
        .notEmpty()
        .withMessage("Name cannot be empty")
        .isLength({ min: 2 })
        .withMessage("Name must be at least 2 characters"),

    body("sex")
        .optional()
        .isIn(["male", "female", "other"])
        .withMessage("Invalid sex value"),

    body("sexDetails")
        .optional()
        .if(body("sex").equals("other"))
        .notEmpty()
        .withMessage("Sex details is required when sex is 'other'")
        .isLength({ min: 2 })
        .withMessage("Sex details must be at least 2 characters"),

    body("age")
        .optional()
        .isInt({ min: 1, max: 120 })
        .withMessage("Age must be between 1 to 120"),

    body("mobileNumber")
        .optional()
        .custom((value) => {
            const { error } = mobileSchema.validate(value);
            if (error) {
                throw new Error("Invalid mobile number");
            }
            return true;
        }),

    body("idProofType")
        .optional()
        .isIn([
            "aadhaar",
            "pancard",
            "passport",
            "driving_license",
            "voter",
            "other", 
        ])
        .withMessage("Invalid ID proof type"),

    body("idProofTypeDetails")
        .optional()
        .if(body("idProofType").equals("other"))
        .notEmpty()
        .withMessage("ID proof type details is required when ID proof type is 'other'")
        .isLength({ min: 2 })
        .withMessage("ID proof type details must be at least 2 characters"),

    body("idProofNumber")
        .optional()
        .custom(idProofValidator),

    body("maritalStatus")
        .optional()
        .isIn(["single", "married", "divorced", "widowed", "other"])
        .withMessage("Invalid marital status"),

    body("maritalStatusDetails")
        .optional()
        .if(body("maritalStatus").equals("other"))
        .notEmpty()
        .withMessage("Marital status details is required when marital status is 'other'")
        .isLength({ min: 2 })
        .withMessage("Marital status details must be at least 2 characters"),
];

// ================= CREATE RELATIVE =================

exports.createRelativeValidation = [
    body("name")
        .notEmpty()
        .withMessage("Name is required"),

     body("sex")
        .notEmpty()
        .withMessage("Sex is required")
        .isIn(["male", "female", "other"])
        .withMessage("Invalid sex value"),

    body("sexDetails")
        .if(body("sex").equals("other"))
        .notEmpty()
        .withMessage("Sex details is required when sex is 'other'")
        .isLength({ min: 2 })
        .withMessage("Sex details must be at least 2 characters"),

    body("age")
        .notEmpty()
        .withMessage("Age is required"),

    body("mobileNumber")
        .custom((value) => {
            const { error } = mobileSchema.validate(value);
            if (error) {
                throw new Error("Invalid mobile number");
            }
            return true;
        }),

    body("maritalStatus")
        .optional()
        .isIn(["single", "married", "divorced", "widowed", "other"])
        .withMessage("Invalid marital status"),

    body("maritalStatusDetails")
        .if(body("maritalStatus").equals("other"))
        .notEmpty()
        .withMessage("Marital status details is required when marital status is 'other'")
        .isLength({ min: 2 })
        .withMessage("Marital status details must be at least 2 characters"),

    body("idProofType")
        .notEmpty()
        .withMessage("ID proof type is required")
        .isIn([
            "aadhaar",
            "pancard",
            "passport",
            "driving_license",
            "voter",
            "other", 
        ])
        .withMessage("Invalid ID proof type"),

    body("idProofTypeDetails")
        .if(body("idProofType").equals("other"))
        .notEmpty()
        .withMessage("ID proof type details is required when ID proof type is 'other'")
        .isLength({ min: 2 })
        .withMessage("ID proof type details must be at least 2 characters"),

    body("idProofNumber")
        .notEmpty()
        .withMessage("ID proof number is required")
        .custom(idProofValidator),
];

// ================= UPDATE RELATIVE VALIDATION =================

exports.updateRelativeValidation = [
    body("name")
        .optional()
        .notEmpty()
        .withMessage("Name cannot be empty"),

    body("sex")
        .optional()
        .isIn(["male", "female", "other"])
        .withMessage("Invalid sex value"),

    body("sexDetails")
        .optional()
        .if(body("sex").equals("other"))
        .notEmpty()
        .withMessage("Sex details is required when sex is 'other'")
        .isLength({ min: 2 })
        .withMessage("Sex details must be at least 2 characters"),

    body("age")
        .optional()
        .isInt({ min: 1, max: 120 })
        .withMessage("Age must be between 1 to 120"),

    body("mobileNumber")
        .optional()
        .custom((value) => {
            const { error } = mobileSchema.validate(value);
            if (error) {
                throw new Error("Invalid mobile number");
            }
            return true;
        }),

    body("maritalStatus")
        .optional()
        .isIn(["single", "married", "divorced", "widowed", "other"])
        .withMessage("Invalid marital status"),

    body("maritalStatusDetails")
        .optional()
        .if(body("maritalStatus").equals("other"))
        .notEmpty()
        .withMessage("Marital status details is required when marital status is 'other'")
        .isLength({ min: 2 })
        .withMessage("Marital status details must be at least 2 characters"),

    body("idProofType")
        .optional()
        .isIn([
            "aadhaar",
            "pancard",
            "passport",
            "driving_license",
            "voter",
            "other", 
        ])
        .withMessage("Invalid ID proof type"),

    body("idProofTypeDetails")
        .optional()
        .if(body("idProofType").equals("other"))
        .notEmpty()
        .withMessage("ID proof type details is required when ID proof type is 'other'")
        .isLength({ min: 2 })
        .withMessage("ID proof type details must be at least 2 characters"),

    body("idProofNumber")
        .optional()
        .custom(idProofValidator),
];


// ================= LOGIN =================
exports.loginValidation = [

    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
];

// ================= CREATE DOCTOR =================

exports.createDoctorValidation = [

    body("name")
        .notEmpty()
        .withMessage("Doctor name is required"),

    body("mobileNumber")
        .custom((value) => {
            const { error } = mobileSchema.validate(value);

            if (error) {
                throw new Error("Invalid mobile number");
            }

            return true;
        }),

    body("email")
        .custom((value) => {
            const { error } = emailSchema.validate(value);

            if (error) {
                throw new Error("Invalid email address");
            }

            return true;
        }),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be minimum 6 characters"),
];

// ================= CREATE EMPLOYEE =================
exports.createEmployeeValidation = [

    body("name")
        .notEmpty()
        .withMessage("Employee name is required"),

    body("mobileNumber")
        .custom((value) => {
            const { error } = mobileSchema.validate(value);

            if (error) {
                throw new Error("Invalid mobile number");
            }

            return true;
        }),

    body("email")
        .custom((value) => {
            const { error } = emailSchema.validate(value);

            if (error) {
                throw new Error("Invalid email address");
            }

            return true;
        }),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be minimum 6 characters"),
];

exports.updatePatientValidation = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage("Name must be at least 2 characters")
        .isLength({ max: 100 })
        .withMessage("Name cannot exceed 100 characters"),

    body("age")
        .optional()
        .isInt({ min: 1, max: 120 })
        .withMessage("Age must be between 1 to 120"),

    body("sex")
        .optional()
        .isIn(["male", "female", "other"])
        .withMessage("Invalid sex value"),

    // Conditional validation for sexDetails when sex is "other"
    body("sexDetails")
        .if((value, { req }) => req.body.sex === "other")
        .notEmpty()
        .withMessage("Sex details is required when sex is 'other'")
        .trim()
        .isLength({ min: 2 })
        .withMessage("Sex details must be at least 2 characters"),

    // Contact Information
    body("mobileNumber")
        .optional()
        .custom((value) => {
            if (!value) return true; // Allow empty if not provided
            
            const { error } = mobileSchema.validate(value);
            if (error) {
                throw new Error("Invalid mobile number format");
            }
            return true;
        }),

    body("address")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Address cannot exceed 500 characters"),

    // Marital Status
    body("maritalStatus")
        .optional()
        .isIn(["single", "married", "divorced", "widowed", "other"])
        .withMessage("Invalid marital status"),

    // Conditional validation for maritalStatusDetails
    body("maritalStatusDetails")
        .if((value, { req }) => req.body.maritalStatus === "other")
        .notEmpty()
        .withMessage("Marital status details is required when marital status is 'other'")
        .trim()
        .isLength({ min: 2 })
        .withMessage("Marital status details must be at least 2 characters"),

    body("durationOfMarriage")
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage("Duration of marriage cannot exceed 50 characters"),

    // Referral Information
    body("howToFindClinic")
        .optional()
        .isIn([
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
        ])
        .withMessage("Invalid source"),

    // Conditional validation for howToFindClinicDetails
    body("howToFindClinicDetails")
        .if((value, { req }) => req.body.howToFindClinic === "other")
        .notEmpty()
        .withMessage("Source details is required when source is 'other'")
        .trim()
        .isLength({ min: 2 })
        .withMessage("Source details must be at least 2 characters"),

    body("referredByDoctorName")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Doctor name cannot exceed 100 characters"),

    // ID Proof Details
    body("idProofType")
        .optional()
        .isIn([
            "aadhaar",
            "pancard",
            "passport",
            "driving_license",
            "voter",
            "other",
        ])
        .withMessage("Invalid ID proof type"),

    // Conditional validation for idProofTypeDetails
    body("idProofTypeDetails")
        .if((value, { req }) => req.body.idProofType === "other")
        .notEmpty()
        .withMessage("ID proof type details is required when ID proof type is 'other'")
        .trim()
        .isLength({ min: 2 })
        .withMessage("ID proof type details must be at least 2 characters"),

    body("idProofNumber")
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage("ID proof number cannot exceed 50 characters"),

    // Infertility Type
    body("infertiliyType")
        .optional()
        .isIn(["primary", "secondary", "other"])
        .withMessage("Invalid infertility type"),

    // Conditional validation for infertiliyTypeDetails
    body("infertiliyTypeDetails")
        .if((value, { req }) => req.body.infertiliyType === "other")
        .notEmpty()
        .withMessage("Infertility type details is required when infertility type is 'other'")
        .trim()
        .isLength({ min: 2 })
        .withMessage("Infertility type details must be at least 2 characters"),

    // Status
    body("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean value"),

    // Relative Validation (if provided)
    body("relative")
        .optional()
        .custom((value) => {
            // If relative is null, that's fine (it means delete relative)
            if (value === null) {
                return true;
            }

            // If relative is provided as an object, validate its fields
            if (typeof value !== 'object') {
                throw new Error("Relative must be an object or null");
            }

            // If relative object is empty, that's fine (it means no relative)
            if (Object.keys(value).length === 0) {
                return true;
            }

            return true;
        }),

    // Relative fields validation (only if relative is provided and not null)
    body("relative.role")
        .if((value, { req }) => req.body.relative && req.body.relative !== null && Object.keys(req.body.relative).length > 0)
        .optional()
        .isIn([
            "husband",
            "wife",
            "father",
            "mother",
            "son",
            "daughter",
            "brother",
            "sister",
            "other",
        ])
        .withMessage("Invalid relative role"),

    body("relative.name")
        .if((value, { req }) => req.body.relative && req.body.relative !== null && Object.keys(req.body.relative).length > 0)
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage("Relative name must be at least 2 characters")
        .isLength({ max: 100 })
        .withMessage("Relative name cannot exceed 100 characters"),

    body("relative.age")
        .if((value, { req }) => req.body.relative && req.body.relative !== null && Object.keys(req.body.relative).length > 0)
        .optional()
        .isInt({ min: 1, max: 120 })
        .withMessage("Relative age must be between 1 to 120"),

    body("relative.sex")
        .if((value, { req }) => req.body.relative && req.body.relative !== null && Object.keys(req.body.relative).length > 0)
        .optional()
        .isIn(["male", "female", "other"])
        .withMessage("Invalid relative sex value"),

    // Conditional validation for relative sexDetails
    body("relative.sexDetails")
        .if((value, { req }) => {
            return req.body.relative && 
                   req.body.relative !== null && 
                   req.body.relative.sex === "other";
        })
        .notEmpty()
        .withMessage("Relative sex details is required when sex is 'other'")
        .trim()
        .isLength({ min: 2 })
        .withMessage("Relative sex details must be at least 2 characters"),

    body("relative.mobileNumber")
        .if((value, { req }) => req.body.relative && req.body.relative !== null && Object.keys(req.body.relative).length > 0)
        .optional()
        .custom((value) => {
            if (!value) return true; // Allow empty if not provided
            
            const { error } = mobileSchema.validate(value);
            if (error) {
                throw new Error("Invalid relative mobile number format");
            }
            return true;
        }),

    body("relative.address")
        .if((value, { req }) => req.body.relative && req.body.relative !== null && Object.keys(req.body.relative).length > 0)
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Relative address cannot exceed 500 characters"),

    body("relative.maritalStatus")
        .if((value, { req }) => req.body.relative && req.body.relative !== null && Object.keys(req.body.relative).length > 0)
        .optional()
        .isIn(["single", "married", "divorced", "widowed", "other"])
        .withMessage("Invalid relative marital status"),

    // Conditional validation for relative maritalStatusDetails
    body("relative.maritalStatusDetails")
        .if((value, { req }) => {
            return req.body.relative && 
                   req.body.relative !== null && 
                   req.body.relative.maritalStatus === "other";
        })
        .notEmpty()
        .withMessage("Relative marital status details is required when marital status is 'other'")
        .trim()
        .isLength({ min: 2 })
        .withMessage("Relative marital status details must be at least 2 characters"),

    body("relative.idProofType")
        .if((value, { req }) => req.body.relative && req.body.relative !== null && Object.keys(req.body.relative).length > 0)
        .optional()
        .isIn([
            "aadhaar",
            "pancard",
            "passport",
            "driving_license",
            "voter",
            "other",
        ])
        .withMessage("Invalid relative ID proof type"),

    // Conditional validation for relative idProofTypeDetails
    body("relative.idProofTypeDetails")
        .if((value, { req }) => {
            return req.body.relative && 
                   req.body.relative !== null && 
                   req.body.relative.idProofType === "other";
        })
        .notEmpty()
        .withMessage("Relative ID proof type details is required when ID proof type is 'other'")
        .trim()
        .isLength({ min: 2 })
        .withMessage("Relative ID proof type details must be at least 2 characters"),

    body("relative.idProofNumber")
        .if((value, { req }) => req.body.relative && req.body.relative !== null && Object.keys(req.body.relative).length > 0)
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage("Relative ID proof number cannot exceed 50 characters"),

    body("relative.isActive")
        .if((value, { req }) => req.body.relative && req.body.relative !== null && Object.keys(req.body.relative).length > 0)
        .optional()
        .isBoolean()
        .withMessage("Relative isActive must be a boolean value"),
];