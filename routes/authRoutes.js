const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');  // Ensure the controller exists
const AuthController = require('../controllers/authController');  // Ensure the controller exists
const {googleLogin} = require('../controllers/loginController');

// Check if the loginController has a 'login' function
router.post('/login', loginController.login);
router.put('/students/:uniqueId/change-password', AuthController.changeStudentPassword);
router.post('/google-login', googleLogin);
module.exports = router;
