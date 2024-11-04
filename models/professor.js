const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const professorSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, unique: true, required: true }, // Unique email for login
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
});

// Hash password before saving to database
professorSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('Professor', professorSchema);
