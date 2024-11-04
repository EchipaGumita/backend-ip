const mongoose = require('mongoose');

const subgroupSchema = new mongoose.Schema({
    subgroup_id: { type: String, unique: true },
    subgroup_name: { type: String, required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: false }], // Reference to Student model
}, { timestamps: true });

module.exports = mongoose.model('Subgroup', subgroupSchema);
