const { body } = require("express-validator");
const Joi = require("joi");


// ================= COMMON JOI =================

const mobileSchema = Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required();

const emailSchema = Joi.string()
    .email()
    .required();


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
            "pan_card",
            "passport",
            "driving_license",
        ])
        .withMessage("Invalid ID proof type"),

    body("idProofNumber")
        .notEmpty()
        .withMessage("ID proof number is required"),

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

    // body("email")
    //     .custom((value) => {
    //         const { error } = emailSchema.validate(value);

    //         if (error) {
    //             throw new Error("Invalid email address");
    //         }

    //         return true;
    //     }),

    body("idProofType")
        .notEmpty()
        .withMessage("ID proof type is required"),

    body("idProofNumber")
        .notEmpty()
        .withMessage("ID proof number is required"),
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