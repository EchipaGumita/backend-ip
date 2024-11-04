const Subgroup = require('../models/subgroup'); // Import the updated Subgroup model
const Group = require('../models/group'); // Import the Group model if needed for validation

// Create a new subgroup
const createSubgroup = async (req, res) => {
    try {
        const { subgroup_id, subgroup_name, students } = req.body; // Expect these fields in the request body

        // Create a new Subgroup instance
        const subgroup = new Subgroup({
            subgroup_id,
            subgroup_name,
            students
        });

        // Save the subgroup to the database
        await subgroup.save();

        // Return the created subgroup
        res.status(201).json(subgroup);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Add a student to a subgroup
const addStudentToSubgroup = async (req, res) => {
    try {
        const { subgroupId } = req.params;
        const { student } = req.body; // Expecting the student object ID in the request body

        // Find the subgroup by its ID
        const subgroup = await Subgroup.findById(subgroupId);
        if (!subgroup) {
            return res.status(404).json({ message: 'Subgroup not found' });
        }

        // Check if the student already exists in the subgroup
        if (subgroup.students.includes(student)) {
            return res.status(400).json({ message: 'Student already in subgroup' });
        }

        // Add the student to the subgroup's students array
        subgroup.students.push(student);
        await subgroup.save();

        res.status(200).json(subgroup);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all students in a subgroup
const getStudentsInSubgroup = async (req, res) => {
    try {
        const { subgroupId } = req.params;

        // Find the subgroup by its ID
        const subgroup = await Subgroup.findById(subgroupId).populate('students'); // Populate to get student details
        if (!subgroup) {
            return res.status(404).json({ message: 'Subgroup not found' });
        }

        res.status(200).json(subgroup.students); // Return the list of student IDs or full student objects
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createSubgroup, addStudentToSubgroup, getStudentsInSubgroup };
