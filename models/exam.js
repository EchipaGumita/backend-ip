const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    mainProfessor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true },
    secondaryProfessor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor' },
    faculty: { type: String, required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },  // Changed to reference Group
    date: { type: Date, required: true },
    hour: { type: String, required: true },
    duration: { type: Number, required: true },  // Duration in minutes
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
