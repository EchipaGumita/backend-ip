const Student = require('../models/student');
const Professor = require('../models/professor');
const bcrypt = require('bcrypt');

// Change password for a student
const changeStudentPassword = async (req, res) => {
    try {
        // Extract uniqueId from the route parameter
        const uniqueId = req.params.uniqueId;
        const { currentPassword, newPassword } = req.body;

        // Find the student by uniqueId
        const student = await Student.findOne({ uniqueId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if the current password matches
        const isMatch = await bcrypt.compare(currentPassword, student.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash the new password and update it
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(newPassword, salt);
        await student.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error changing password', error: error.message });
    }
};

// Change password for a professor
const changeProfessorPassword = async (req, res) => {
    try {
        const { professor_id, currentPassword, newPassword } = req.body;

        const professor = await Professor.findById(professor_id);
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, professor.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        professor.password = await bcrypt.hash(newPassword, 10);
        await professor.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { changeStudentPassword, changeProfessorPassword };
