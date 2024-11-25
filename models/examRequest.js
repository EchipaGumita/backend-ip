const mongoose = require('mongoose');

const examRequestSchema = new mongoose.Schema({
    studentUniqueId: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    examDate: { type: Date, required: true },  // Ensure it's Date, not String
    examDuration: { type: Number, required: true },  // Ensure it's Number
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    hour: { type: String, required: true },
    mainProfessor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true },
    secondaryProfessor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor' },
    faculty: { type: String, required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    approved: { type: Boolean, default: false },
    reason: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ExamRequest', examRequestSchema);
