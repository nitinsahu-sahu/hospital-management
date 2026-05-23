// routes/user.route.js

const express = require("express");

const {
  createDoctor,
  createEmployee,
  loginUser,
  logout,
} = require("../controllers/user.controller");
const isAuth = require('../middlewares/isAuth.middleware');
const { validate } = require("../middlewares/validate.middleware");
const {
  createPatientValidation,
  createDoctorValidation,
  createEmployeeValidation,
  loginValidation,
  createRelativeValidation
} = require("../validators/user.validator");
const router = express.Router();

// ================= AUTH =================

router.post("/login", loginValidation, validate, loginUser);
router.post("/logout", isAuth, logout);

// ================= DOCTOR =================

router.post("/doctor/create", createDoctor);

// ================= EMPLOYEE =================

router.post("/employee/create", createEmployee);

module.exports = router;