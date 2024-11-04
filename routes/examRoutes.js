const express = require('express');
const router = express.Router();
const { createExam, getExams, editExam, getExamsByProfessorId } = require('../controllers/examController');

// Create a new exam
router.post('/exams', createExam);

// Get all exams
router.get('/exams', getExams);

// Edit an existing exam by ID
router.put('/exams/:id', editExam);

// Get exams by professor ID
router.get('/exams/professor/:professor_id', getExamsByProfessorId); // Add this line

module.exports = router;
