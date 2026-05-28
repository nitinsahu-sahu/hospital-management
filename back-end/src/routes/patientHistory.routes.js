// routes/patientHistory.routes.js
const express = require('express');
const router = express.Router();
const isAuth = require('../middlewares/isAuth.middleware');

// const { protect, authorize } = require('../middleware/auth');
const {
    createPatientHistory,
    getPatientHistoryByPatientId,
    updatePatientHistory,
    deletePatientHistory,
    getAllPatientHistories
} = require('../controllers/patientHistory.controller');

// All routes are protected
router.use(isAuth);

// Get all patient histories (with pagination)
router.get('/', getAllPatientHistories);

// Create patient history
router.post('/', createPatientHistory);

// Get patient history by patient ID
router.get('/patient/:patientId', getPatientHistoryByPatientId);

// Update patient history
router.put('/patient/:patientId', updatePatientHistory);

// Delete patient history
router.delete('/patient/:patientId', deletePatientHistory);

module.exports = router;