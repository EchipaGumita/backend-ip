const express = require('express');
const router = express.Router();
const { createClassroom, checkClassroomAvailability } = require('../controllers/classroomController');

// Create a new classroom
router.post('/classrooms', createClassroom);

// Check classroom availability on a specific date
router.get('/classrooms/availability/:date', checkClassroomAvailability);

module.exports = router;
