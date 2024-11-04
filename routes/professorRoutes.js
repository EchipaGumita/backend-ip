const express = require('express');
const router = express.Router();
const { registerProfessor, loginProfessor, getProfessors } = require('../controllers/professorController');
const { auth, isAdmin } = require('../middleware/authMiddleware');

// Register a new professor
router.post('/professors/register', registerProfessor);

// Login for professor
router.post('/professors/login', loginProfessor);

// Get all professors (admin only)
router.get('/auth/professors', auth, isAdmin, getProfessors);

module.exports = router;
