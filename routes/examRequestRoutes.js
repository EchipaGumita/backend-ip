const express = require('express');
const router = express.Router();
const examRequestController = require('../controllers/examRequestController');

// Create a new exam request
router.post('/', examRequestController.createExamRequest);

// Approve or deny an exam request
router.put('/:requestId', examRequestController.handleExamRequest);

// Get all exam requests
router.get('/', examRequestController.getAllExamRequests);

// Get exam requests by specific criteria (e.g., faculty, group, date)
router.get('/filter', examRequestController.getExamRequestsByFilter);
module.exports = router;
