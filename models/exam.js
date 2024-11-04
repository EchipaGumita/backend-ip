const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    exam_id: mongoose.Schema.Types.ObjectId,
    course_id: String,
    course_name: String,
    professor_id: mongoose.Schema.Types.ObjectId,
    professor_name: String,
    exam_type: String, // "Exam" or "Colloquium"
    date: Date,
    duration_minutes: Number,
    classroom_id: mongoose.Schema.Types.ObjectId,
    classroom_name: String,
    group_id: mongoose.Schema.Types.ObjectId,
});

module.exports = mongoose.model('Exam', examSchema);
