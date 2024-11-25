const jwt = require('jsonwebtoken');

// Use the JWT_SECRET from the .env file
const JWT_SECRET = process.env.JWT_SECRET;

// Generate JWT token
const generateJWT = (uniqueId) => {
  const payload = { uniqueId };  // Use uniqueId instead of studentId
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  return token;
};

module.exports = { generateJWT };
