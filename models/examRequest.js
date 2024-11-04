const mongoose = require('mongoose');

const examRequestSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Student' // Assuming you have a Student model
    },
    exam_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Exam' // Reference to the Exam model
    },
    request_date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    comments: String // Optional comments from the professor or admin
});

module.exports = mongoose.model('ExamRequest', examRequestSchema);
