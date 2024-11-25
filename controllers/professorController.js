const Professor = require('../models/professor');
const bcrypt = require('bcrypt');
const { generateJWT } = require('../utils/jwtUtil');

// Create a new professor
exports.createProfessor = async (req, res) => {
    try {
        const professorData = req.body;
        const newProfessor = new Professor(professorData);
        await newProfessor.save();
        res.status(201).json({ message: 'Professor created successfully', professor: newProfessor });
    } catch (error) {
        res.status(400).json({ message: 'Error creating professor', error: error.message });
    }
};
// get all professors
exports.GetProfessors = async (req, res) => {
    try {
        const professors = await Professor.find();
        res.status(200).json({ professors });
    } catch (error) {
        res.status(400).json({ message: 'Error fetching professors', error: error.message });
    }
};
// Update an existing professor
exports.updateProfessor = async (req, res) => {
    try {
        const uniqueId = req.params.uniqueId;
        const updates = req.body;

        // If password is in updates, hash it before saving
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        const updatedProfessor = await Professor.findOneAndUpdate({ uniqueId }, updates, { new: true });

        if (!updatedProfessor) {
            return res.status(404).json({ message: 'Professor not found' });
        }
        res.status(200).json({ message: 'Professor updated successfully', professor: updatedProfessor });
    } catch (error) {
        res.status(400).json({ message: 'Error updating professor', error: error.message });
    }
};

// Delete a professor
exports.deleteProfessor = async (req, res) => {
    try {
        const uniqueId = req.params.uniqueId;
        const deletedProfessor = await Professor.findOneAndDelete({ uniqueId });

        if (!deletedProfessor) {
            return res.status(404).json({ message: 'Professor not found' });
        }
        res.status(200).json({ message: 'Professor deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting professor', error: error.message });
    }
};
exports.getProfessorByUniqueId = async (req, res) => {
    try {
        const uniqueId = req.params.uniqueId;
        
        const professor = await Professor.findOne({ uniqueId });
        
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        res.status(200).json({ professor });
    } catch (error) {
        res.status(400).json({ message: 'Error retrieving professor', error: error.message });
    }
};

