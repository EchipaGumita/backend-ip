const express = require('express');
const passport = require('passport');
const router = express.Router();

// Redirect to Google for authentication
const { changeStudentPassword, changeProfessorPassword } = require('../controllers/authController');

router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Google OAuth callback route
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect or respond with a token
        res.redirect('/dashboard');  // Adjust redirect as needed
    }
);
router.put('/students/change-password', changeStudentPassword);

// Change password for a professor
router.put('/professors/change-password', changeProfessorPassword);

module.exports = router;
