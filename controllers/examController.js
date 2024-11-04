const Exam = require('../models/exam');

// Create a new exam
const createExam = async (req, res) => {
    try {
        const exam = new Exam({
            ...req.body,
            professor_id: req.body.professor_id,  // Ensure the professor ID is included
            professor_name: req.body.professor_name // Ensure the professor name is included
        });
        await exam.save();
        res.status(201).json(exam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Edit an existing exam
const editExam = async (req, res) => {
    try {
        const { id } = req.params; // Extract the exam ID from the request parameters
        const updatedExam = await Exam.findByIdAndUpdate(id, {
            ...req.body,
            professor_id: req.body.professor_id, // Update professor ID
            professor_name: req.body.professor_name // Update professor name
        }, {
            new: true, // Return the updated document
            runValidators: true // Validate the new data against the schema
        });

        if (!updatedExam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        res.status(200).json(updatedExam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all exams
const getExams = async (req, res) => {
    try {
        const exams = await Exam.find();
        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Get exams by professor ID
const getExamsByProfessorId = async (req, res) => {
    try {
        const { professor_id } = req.params; // Extract professor ID from request parameters
        const exams = await Exam.find({ professor_id }); // Query exams by professor ID

        if (exams.length === 0) {
            return res.status(404).json({ message: 'No exams found for this professor.' });
        }

        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Exporting all functions, including the new one
module.exports = { createExam, getExams, editExam, getExamsByProfessorId };
