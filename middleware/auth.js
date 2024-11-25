const jwt = require('jsonwebtoken');
const Student = require('../models/student');
const Professor = require('../models/professor');

// Use the JWT_SECRET from the .env file
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateJWT = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the JWT token and decode its payload
    const decoded = jwt.verify(token, JWT_SECRET);
    const uniqueId = decoded.uniqueId; // Extract uniqueId from the token payload

    // Check for the user in both models
    let user = await Student.findOne({ uniqueId });
    if (!user) {
      user = await Professor.findOne({ uniqueId });
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach the user info to the request object for future use
    req.user = user;
    req.userType = user instanceof Student ? 'student' : 'professor';

    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    // If token is invalid or expired, handle the error
    res.status(400).json({ message: 'Invalid or expired token', error: error.message });
  }
};

module.exports = { authenticateJWT };
