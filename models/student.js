const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const studentSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    password: { type: String, required: true },
    year: { type: Number, required: true },
    faculty: { type: String, required: true, enum: ['c', 'esm', 'aia','escca','ea','etti','me','rst','se'] },
    major: { type: String, required: true },
    gender: { type: String, required: true, enum: ['male', 'female'] },
    uniqueId: { type: String, unique: true }
});

// Generate unique ID
studentSchema.pre('save', async function (next) {
    if (this.isNew) {
        const genderCode = this.gender === 'male' ? '5' : '6';
        const facultyCode = this.faculty === 'calculatoare' ? '1' : this.faculty === 'esm' ? '2' : '3';
        const uniqueString = crypto.randomBytes(5).toString('hex'); // 5 bytes hex for encrypted part
        this.uniqueId = `${genderCode}-${facultyCode}-${uniqueString}`;
    }

    // Encrypt the password
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    next();
});

// Ensure `uniqueId` is unique and indexed
studentSchema.index({ uniqueId: 1 }, { unique: true });
studentSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};
module.exports = mongoose.model('Student', studentSchema);
