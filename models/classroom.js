const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    classroom_id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    booked_dates: [{ type: String }] // Store booked dates as strings in ISO format
});

module.exports = mongoose.model('Classroom', classroomSchema);
