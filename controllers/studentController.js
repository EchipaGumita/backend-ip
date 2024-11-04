const Student = require('../models/student');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Create a new student
const createStudent = async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all students
const getStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Register a new student
const registerStudent = async (req, res) => {
    try {
        const { student_id, first_name, last_name, email, password, year, faculty, major, group_id, subgroup_id } = req.body;
        
        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        const student = new Student({
            student_id,
            first_name,
            last_name,
            email,
            password: hashedPassword,
            year,
            faculty,
            major,
            group_id,
            subgroup_id
        });

        await student.save();
        res.status(201).json({ message: "Student registered successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Login for a student
const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await Student.findOne({ email });

        if (!student || !(await bcrypt.compare(password, student.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: student._id, student_id: student.student_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Assign student to a group
const assignStudentToGroup = async (req, res) => {
    try {
        const { student_id, group_id } = req.body;

        const student = await Student.findById(student_id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.group_id = group_id; // Assign group ID
        await student.save();

        res.status(200).json({ message: 'Student assigned to group successfully', student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Assign student to a subgroup
const assignStudentToSubgroup = async (req, res) => {
    try {
        const { student_id, subgroup_id } = req.body;

        const student = await Student.findById(student_id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.subgroup_id = subgroup_id; // Assign subgroup ID
        await student.save();

        res.status(200).json({ message: 'Student assigned to subgroup successfully', student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Assign student to a course
const assignStudentToCourse = async (req, res) => {
    try {
        const { student_id, course_id, course_name } = req.body;

        const student = await Student.findById(student_id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Push the course into the courses array
        student.courses.push({ course_id, course_name });
        await student.save();

        res.status(200).json({ message: 'Student assigned to course successfully', student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createStudent,
    getStudents,
    registerStudent,
    loginStudent,
    assignStudentToGroup,
    assignStudentToSubgroup,
    assignStudentToCourse,
};
