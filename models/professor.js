const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const professorSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    password: { type: String, required: true },
    department: { type: String, required: true },
    gender: { type: String, required: true, enum: ['male', 'female'] },
    uniqueId: { type: String, unique: true },
    isAdmin: { type: Boolean, default: false } // Default to false (not an admin)
});

// Generate unique ID
professorSchema.pre('save', async function (next) {
    if (this.isNew) {
        const genderCode = this.gender === 'male' ? '5' : '6';
        const departmentCode = this.department.slice(0, 3); // First 3 letters of department for example
        const uniqueString = crypto.randomBytes(5).toString('hex'); // 5 bytes hex for encrypted part
        this.uniqueId = `${genderCode}-${departmentCode}-${uniqueString}`;
    }

    // Encrypt the password
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    next();
});

// Ensure `uniqueId` is unique and indexed
professorSchema.index({ uniqueId: 1 }, { unique: true });
professorSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Professor', professorSchema);
