const Classroom = require('../models/classroom');

// Create a new classroom
exports.createClassroom = async (req, res) => {
    try {
        const { name, building } = req.body;
        const classroom = new Classroom({ name, building });
        await classroom.save();
        res.status(201).json({ message: 'Classroom created successfully', classroom });
    } catch (error) {
        res.status(400).json({ message: 'Error creating classroom', error: error.message });
    }
};

// Edit an existing classroom
exports.updateClassroom = async (req, res) => {
    try {
        const { classroomId } = req.params;
        const updates = req.body;

        const updatedClassroom = await Classroom.findByIdAndUpdate(classroomId, updates, { new: true });
        if (!updatedClassroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        res.status(200).json({ message: 'Classroom updated successfully', classroom: updatedClassroom });
    } catch (error) {
        res.status(400).json({ message: 'Error updating classroom', error: error.message });
    }
};

// Delete a classroom
exports.deleteClassroom = async (req, res) => {
    try {
        const { classroomId } = req.params;

        const deletedClassroom = await Classroom.findByIdAndDelete(classroomId);
        if (!deletedClassroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        res.status(200).json({ message: 'Classroom deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting classroom', error: error.message });
    }
};

// Get all booked dates for a classroom
exports.getAllBookedDates = async (req, res) => {
    try {
        const { classroomId } = req.params;
        const classroom = await Classroom.findById(classroomId);

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        res.status(200).json({ booked_dates: classroom.booked_dates });
    } catch (error) {
        res.status(400).json({ message: 'Error retrieving booked dates', error: error.message });
    }
};

// Add a booked date for a classroom
exports.addBookedDate = async (req, res) => {
    try {
        const { classroomId } = req.params;
        const { date_booked } = req.body;

        const classroom = await Classroom.findById(classroomId);

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Check if the date is already booked
        if (classroom.booked_dates.includes(date_booked)) {
            return res.status(400).json({ message: 'This date is already booked' });
        }

        // Add the booked date
        classroom.booked_dates.push(date_booked);
        await classroom.save();

        res.status(200).json({ message: 'Date booked successfully', classroom });
    } catch (error) {
        res.status(400).json({ message: 'Error booking date', error: error.message });
    }
};

// Check if a date is available for booking
exports.checkDateAvailability = async (req, res) => {
    try {
        const { classroomId, date } = req.params;

        const classroom = await Classroom.findById(classroomId);

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Check if the date is already booked
        const isAvailable = !classroom.booked_dates.includes(date);
        
        if (isAvailable) {
            return res.status(200).json({ message: 'Date is available' });
        } else {
            return res.status(400).json({ message: 'This date is already booked' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error checking date availability', error: error.message });
    }
};
