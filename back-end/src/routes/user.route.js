// routes/user.route.js

const express = require("express");

const {
  createPatient,
  createDoctor,
  createEmployee,
  loginUser,
  getAllPatients,
  logout,
} = require("../controllers/user.controller");

const router = express.Router();

// ================= AUTH =================

router.post("/login", loginUser);
router.post("/logout", logout);

// ================= PATIENT =================

router.post("/patient/create", createPatient);

router.get("/patients", getAllPatients);

// ================= DOCTOR =================

router.post("/doctor/create", createDoctor);

// ================= EMPLOYEE =================

router.post("/employee/create", createEmployee);

module.exports = router;