const express = require('express');
const router = express.Router();
const {
    createStudent,
    getStudents,
    registerStudent,
    loginStudent,
    assignStudentToGroup,
    assignStudentToSubgroup,
    assignStudentToCourse
} = require('../controllers/studentController');

// Create a new student
router.post('/students', createStudent);

// Get all students
router.get('/students', getStudents);

// Register a new student
router.post('/auth/students/register', registerStudent);

// Login for a student
router.post('/auth/students/login', loginStudent);

// Assign student to a group
router.put('/students/assign-group', assignStudentToGroup);

// Assign student to a subgroup
router.put('/students/assign-subgroup', assignStudentToSubgroup);

// Assign student to a course
router.put('/students/assign-course', assignStudentToCourse);

module.exports = router;
