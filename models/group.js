const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    group_id: { type: String, unique: true },
    group_name: { type: String, required: true },
    faculty: { type: String, required: true },
    year: { type: Number, required: true },
    subgroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subgroup' }] // Ensure this is set properly
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
