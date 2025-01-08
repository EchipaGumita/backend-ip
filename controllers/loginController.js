const Student = require('../models/student');
const Professor = require('../models/professor');
const { generateJWT } = require('../utils/jwtUtil');

// Unified login for both students and professors
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try to find the user in both the Student and Professor models
    let user = await Student.findOne({ email });
    let isStudent = true;

    // If not found in Student, look in Professor
    if (!user) {
      user = await Professor.findOne({ email });
      isStudent = false;
    }

    // If no user is found
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log to check if user is found
    console.log('User found:', user);

    // Compare the provided password with the stored password
    const isMatch = await user.comparePassword(password);

    // Log to check if password match works
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = generateJWT(user.uniqueId);

    // Log token generation
    console.log('Generated token:', token);

    // Set token expiration to 10 days (in milliseconds)
    const expiresAt = Date.now() + 10 * 24 * 60 * 60 * 1000; // 10 days in milliseconds

    // Update the user's JWT token and expiration time in the DB
    user.jwtToken = token;
    user.expiresAt = expiresAt;
    await user.save();

    // Respond with the token and user type (student or professor)
    res.status(200).json({
      token,
      userType: isStudent ? 'student' : 'professor',
      user: {
        uniqueId: user.uniqueId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        department: user.department || null,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};