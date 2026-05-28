// routes/user.route.js

const express = require("express");

const {
  createDoctor,
  createEmployee,
  loginUser,
  userPicUpdate,
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
const { uploadImages } = require("../middlewares/upload.middleware");
const router = express.Router();

// ================= AUTH =================

router.post("/login", loginValidation, validate, loginUser);
router.post("/logout", logout);

// ================= DOCTOR =================
router.post("/doctor/create", createDoctor);

// ================= EMPLOYEE =================
router.post("/employee/create", createEmployee);
router.put("/pic", isAuth, uploadImages, userPicUpdate);

module.exports = router;