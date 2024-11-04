const Professor = require('../models/professor');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Register a new professor
const registerProfessor = async (req, res) => {
    try {
        const { first_name, last_name, email, password, isAdmin } = req.body;
        const professor = new Professor({ first_name, last_name, email, password, isAdmin });
        await professor.save();
        res.status(201).json({ message: "Professor registered successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Login for a professor
const loginProfessor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const professor = await Professor.findOne({ email });

        if (!professor || !(await bcrypt.compare(password, professor.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: professor._id, isAdmin: professor.isAdmin }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all professors (admin only)
const getProfessors = async (req, res) => {
    try {
        const professors = await Professor.find();
        res.status(200).json(professors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = { registerProfessor, loginProfessor, getProfessors };
