const Student = require('../models/student');
const bcrypt = require('bcrypt');
const { generateJWT } = require('../utils/jwtUtil'); 
// Create a new student
exports.createStudent = async (req, res) => {
    try {
        const studentData = req.body;
        const newStudent = new Student(studentData);
        await newStudent.save();
        res.status(201).json({ message: 'Student created successfully', student: newStudent });
    } catch (error) {
        res.status(400).json({ message: 'Error creating student', error: error.message });
    }
};

// Update an existing student
exports.updateStudent = async (req, res) => {
    try {
        const uniqueId = req.params.uniqueId;
        const updates = req.body;

        // If password is in updates, hash it before saving
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        const updatedStudent = await Student.findOneAndUpdate({ uniqueId }, updates, { new: true });

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ message: 'Student updated successfully', student: updatedStudent });
    } catch (error) {
        res.status(400).json({ message: 'Error updating student', error: error.message });
    }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
    try {
        const uniqueId = req.params.uniqueId;
        const deletedStudent = await Student.findOneAndDelete({ uniqueId });

        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting student', error: error.message });
    }
};
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        res.status(400).json({ message: 'Error retrieving students', error: error.message });
    }
};

// Get a specific student by uniqueId
exports.getStudentByUniqueId = async (req, res) => {
    try {
        const uniqueId = req.params.uniqueId;
        const student = await Student.findOne({ uniqueId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json(student);
    } catch (error) {
        res.status(400).json({ message: 'Error retrieving student', error: error.message });
    }
};

// Update the password of a student
exports.updateStudentPassword = async (req, res) => {
    try {
        const uniqueId = req.params.uniqueId;
        const { currentPassword, newPassword } = req.body; // Ensure currentPassword and newPassword are included

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Both current and new passwords are required' });
        }

        const student = await Student.findOne({ uniqueId });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Compare current password
        const isMatch = await student.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash and update the new password
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(newPassword, salt);
        await student.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error updating password', error: error.message });
    }
};


// Find students by a specific characteristic (e.g., faculty, major, year)

exports.findStudentsByFaculty = async (req, res) => {
    try {
        const { faculty } = req.body;  // Accessing the parameter from the body
        const query = {};

        if (faculty) query.faculty = faculty;  // Exact match for faculty

        console.log("Constructed query for faculty:", query);  // Log the query for debugging

        const students = await Student.find(query);

        if (students.length === 0) {
            return res.status(404).json({ message: 'No students found for the given faculty' });
        }

        res.status(200).json(students);
    } catch (error) {
        console.log("Error:", error);  // Log any error
        res.status(400).json({ message: 'Error retrieving students by faculty', error: error.message });
    }
};

// Find students by Major (from the request body)
exports.findStudentsByMajor = async (req, res) => {
    try {
        const { major } = req.body;  // Accessing the parameter from the body
        const query = {};

        if (major) query.major = major;  // Exact match for major

        console.log("Constructed query for major:", query);  // Log the query for debugging

        const students = await Student.find(query);

        if (students.length === 0) {
            return res.status(404).json({ message: 'No students found for the given major' });
        }

        res.status(200).json(students);
    } catch (error) {
        console.log("Error:", error);  // Log any error
        res.status(400).json({ message: 'Error retrieving students by major', error: error.message });
    }
};

// Find students by Year (from the request body)
exports.findStudentsByYear = async (req, res) => {
    try {
        const { year } = req.body;  // Accessing the parameter from the body
        const query = {};

        if (year) query.year = year;  // Exact match for year

        console.log("Constructed query for year:", query);  // Log the query for debugging

        const students = await Student.find(query);

        if (students.length === 0) {
            return res.status(404).json({ message: 'No students found for the given year' });
        }

        res.status(200).json(students);
    } catch (error) {
        console.log("Error:", error);  // Log any error
        res.status(400).json({ message: 'Error retrieving students by year', error: error.message });
    }
};
// Find students by Faculty
exports.findStudentsByFaculty = async (req, res) => {
    try {
        const { faculty } = req.query;
        const query = {};

        if (faculty) query.faculty = faculty;  // Exact match for faculty

        console.log("Constructed query for faculty:", query);  // Log the query for debugging

        const students = await Student.find(query);

        if (students.length === 0) {
            return res.status(404).json({ message: 'No students found for the given faculty' });
        }

        res.status(200).json(students);
    } catch (error) {
        console.log("Error:", error);  // Log any error
        res.status(400).json({ message: 'Error retrieving students by faculty', error: error.message });
    }
};

// Find students by Major
exports.findStudentsByMajor = async (req, res) => {
    try {
        const { major } = req.query;
        const query = {};

        if (major) query.major = major;  // Exact match for major

        console.log("Constructed query for major:", query);  // Log the query for debugging

        const students = await Student.find(query);

        if (students.length === 0) {
            return res.status(404).json({ message: 'No students found for the given major' });
        }

        res.status(200).json(students);
    } catch (error) {
        console.log("Error:", error);  // Log any error
        res.status(400).json({ message: 'Error retrieving students by major', error: error.message });
    }
};

// Find students by Year
exports.findStudentsByYear = async (req, res) => {
    try {
        const { year } = req.query;
        const query = {};

        if (year) query.year = year;  // Exact match for year

        console.log("Constructed query for year:", query);  // Log the query for debugging

        const students = await Student.find(query);

        if (students.length === 0) {
            return res.status(404).json({ message: 'No students found for the given year' });
        }

        res.status(200).json(students);
    } catch (error) {
        console.log("Error:", error);  // Log any error
        res.status(400).json({ message: 'Error retrieving students by year', error: error.message });
    }
};

