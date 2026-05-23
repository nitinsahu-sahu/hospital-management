// routes/user.route.js

const express = require("express");

const {
  createPatient,
  createDoctor,
  createEmployee,
  loginUser,
  getAllPatients,
  logout,
  createRelative
} = require("../controllers/user.controller");
const isAuthMiddleware = require('../middlewares/isAuth.middleware');

const router = express.Router();

// ================= AUTH =================

router.post("/login", loginUser);
router.post("/logout", logout);

// ================= PATIENT =================

router.post("/patient/create", isAuthMiddleware, createPatient);
router.post("/relative/create", createRelative);

router.get("/patients", getAllPatients);

// ================= DOCTOR =================

router.post("/doctor/create", createDoctor);

// ================= EMPLOYEE =================

router.post("/employee/create", createEmployee);

module.exports = router;