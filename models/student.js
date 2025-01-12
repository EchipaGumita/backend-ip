const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const facultyCodes = {
    c: '1',
    esm: '2',
    aia: '3',
    escca: '4',
    ea: '5',
    etti: '6',
    me: '7',
    rst: '8',
    se: '9'
};

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
    faculty: { type: String, required: true, enum: Object.keys(facultyCodes) },
    major: { type: String, required: true },
    gender: { type: String, required: true, enum: ['male', 'female'] },
    uniqueId: { type: String, unique: true }
});

// Generate unique ID
studentSchema.pre('save', async function (next) {
    if (this.isNew) {
        const genderCode = this.gender === 'male' ? '5' : '6';
        const facultyCode = facultyCodes[this.faculty];
        if (!facultyCode) {
            return next(new Error('Invalid faculty provided for uniqueId generation.'));
        }
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
