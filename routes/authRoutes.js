const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');  // Ensure the controller exists

// Check if the loginController has a 'login' function
router.post('/login', loginController.login);

module.exports = router;
