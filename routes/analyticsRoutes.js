const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Get Classroom Utilization Analytics
router.get('/classroom-utilization', analyticsController.getClassroomUtilization);

// Get Professor Workload Analytics
router.get('/professor-workload', analyticsController.getProfessorWorkload);

module.exports = router;
