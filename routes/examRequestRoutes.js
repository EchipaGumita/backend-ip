const express = require('express');
const router = express.Router();
const { createExamRequest, getExamRequests, getAllExamRequests } = require('../controllers/examRequestController');

// Create a new exam request
router.post('/exam-requests', createExamRequest);

// Get all exam requests for a specific student
router.get('/exam-requests/student/:student_id', getExamRequests);

// Optional: Get all exam requests (for admin)
router.get('/exam-requests', getAllExamRequests);

module.exports = router;
