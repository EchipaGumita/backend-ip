const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const studentSchema = new mongoose.Schema({
    student_id: { type: String, unique: true, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    year: { type: Number, required: false },
    faculty: { type: String, required: false },
    major: { type: String, required: false },
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    subgroup_id: { type: String },
    courses: [
        {
            course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
            course_name: { type: String, required: true }
        }
    ]
});

// Hash password before saving
studentSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student; // Ensure this line exports the `Student` model directly
