const Classroom = require('../models/classroom');

// Create a new classroom
const createClassroom = async (req, res) => {
    try {
        const classroom = new Classroom(req.body);
        await classroom.save();
        res.status(201).json(classroom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Check if a classroom is available on a specific date
const checkClassroomAvailability = async (req, res) => {
    try {
        const { date } = req.params; // Extract date from request parameters
        const classrooms = await Classroom.find();
        
        // Ensure date is formatted correctly
        const formattedDate = new Date(date).toISOString().split('T')[0];

        // Find available classrooms
        const availableClassrooms = classrooms.filter(classroom => {
            return !classroom.booked_dates.includes(formattedDate); // Compare dates
        });

        res.status(200).json(availableClassrooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Exporting all functions
module.exports = { createClassroom, checkClassroomAvailability };
