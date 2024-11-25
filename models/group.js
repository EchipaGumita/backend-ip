const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubGroup' }] // List of SubGroup ObjectIds
}, { timestamps: true }); // Add createdAt and updatedAt fields

module.exports = mongoose.model('Group', groupSchema);
