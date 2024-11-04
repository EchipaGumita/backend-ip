const ExamRequest = require('../models/examRequest');

// Create a new exam request
const createExamRequest = async (req, res) => {
    try {
        const { student_id, exam_id } = req.body;
        const examRequest = new ExamRequest({ student_id, exam_id });
        await examRequest.save();
        res.status(201).json(examRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all exam requests for a student
const getExamRequests = async (req, res) => {
    try {
        const { student_id } = req.params;
        const examRequests = await ExamRequest.find({ student_id }).populate('exam_id'); // Populate with exam details
        res.status(200).json(examRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all exam requests (optional, for admin view)
const getAllExamRequests = async (req, res) => {
    try {
        const examRequests = await ExamRequest.find().populate('student_id exam_id');
        res.status(200).json(examRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createExamRequest, getExamRequests, getAllExamRequests };
