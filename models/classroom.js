const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    building: { type: String, required: true },
    booked_dates: { type: [Date], required: true },
    booked_slots: [
        {
            date: { type: Date, required: true },
            startTime: { type: String, required: true },  // Start time (e.g., "10:00 AM")
            endTime: { type: String, required: true }     // End time (e.g., "12:00 PM")
        }
    ]
});

module.exports = mongoose.model('Classroom', classroomSchema);
