const mongoose = require('mongoose');

// Define the SubGroup schema
const subGroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    students: [{ type: String }]  // List of students' uniqueIds (not required during creation)
}, { timestamps: true });  // Optional: add timestamps for createdAt and updatedAt

// Create and export the SubGroup model
module.exports = mongoose.model('SubGroup', subGroupSchema);
