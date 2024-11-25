const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');
const { authenticateJWT } = require('../middleware/auth');

// Create a new classroom (requires JWT authentication)
router.post('/', classroomController.createClassroom);

// Edit an existing classroom (requires JWT authentication)
router.put('/:classroomId', classroomController.updateClassroom);

// Delete a classroom (requires JWT authentication)
router.delete('/:classroomId', classroomController.deleteClassroom);
// Get all classrooms (requires JWT authentication)
router.get('/',  classroomController.getAllClassrooms);
// Get all booked dates for a specific classroom (no authentication needed)
router.get('/:classroomId/booked-dates', classroomController.getAllBookedDates);

// Add a booked date to a classroom (no authentication needed)
router.post('/:classroomId/booked-dates', classroomController.addBookedDate);

// Check if a specific date is available for a classroom (no authentication needed)
router.get('/:classroomId/check-date/:date', classroomController.checkDateAvailability);

module.exports = router;
