const express = require('express');
const router = express.Router();
const { addStudentToSubgroup, getStudentsInSubgroup, createSubgroup } = require('../controllers/subgroupController');

// Create a new subgroup
router.post('/subgroups', createSubgroup); // Add this line

// Add a student to a subgroup
router.post('/groups/:groupId/subgroups/:subgroupId/students', addStudentToSubgroup);

// Get all students in a subgroup
router.get('/groups/:groupId/subgroups/:subgroupId/students', getStudentsInSubgroup);

module.exports = router;
