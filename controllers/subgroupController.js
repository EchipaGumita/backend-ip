const SubGroup = require('../models/subGroup');

exports.createSubGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const newSubGroup = new SubGroup({ name });
        await newSubGroup.save();
        res.status(201).json({ message: 'SubGroup created successfully', subGroup: newSubGroup });
    } catch (error) {
        res.status(400).json({ message: 'Error creating SubGroup', error: error.message });
    }
};

exports.addStudentsToSubGroup = async (req, res) => {
    try {
        const { subGroupId, studentUniqueIds } = req.body;
        const subGroup = await SubGroup.findById(subGroupId);
        
        if (!subGroup) {
            return res.status(404).json({ message: 'SubGroup not found' });
        }

        // Filter out students who are already in the subgroup
        const newStudents = studentUniqueIds.filter(studentUniqueId => 
            !subGroup.students.includes(studentUniqueId)
        );

        if (newStudents.length === 0) {
            return res.status(400).json({ message: 'All students are already in the SubGroup' });
        }

        // Add only the new students to the subgroup
        subGroup.students.push(...newStudents);
        await subGroup.save();

        res.status(200).json({ message: 'Students added to SubGroup', subGroup });
    } catch (error) {
        res.status(400).json({ message: 'Error adding students', error: error.message });
    }
};


exports.getAllSubGroups = async (req, res) => {
  try {
    const subGroups = await SubGroup.find();
    res.status(200).json({ subGroups });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching subgroups', error: error.message });
  }
};

exports.getSubGroupByName = async (req, res) => {
  try {
    const { name } = req.params;
    const subGroup = await SubGroup.findOne({ name });
    if (!subGroup) {
      return res.status(404).json({ message: 'SubGroup not found' });
    }
    res.status(200).json({ subGroup });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching SubGroup by name', error: error.message });
  }
};
// Delete a SubGroup by ID
exports.deleteSubGroup = async (req, res) => {
    const { subGroupId } = req.params;  // Assume the subGroupId is passed as a parameter
    try {
        const subGroup = await SubGroup.findByIdAndDelete(subGroupId);
        if (!subGroup) {
            return res.status(404).json({ message: 'SubGroup not found' });
        }
        res.status(200).json({ message: 'SubGroup deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting SubGroup', error: error.message });
    }
};

// Edit a SubGroup by ID
exports.editSubGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const { subGroupId } = req.params;

        // Find the SubGroup by ID
        const subGroup = await SubGroup.findById(subGroupId);
        if (!subGroup) {
            return res.status(404).json({ message: 'SubGroup not found' });
        }

        // Update the SubGroup name
        if (name) {
            subGroup.name = name;
        }

        await subGroup.save();
        res.status(200).json({ message: 'SubGroup updated successfully', subGroup });
    } catch (error) {
        res.status(400).json({ message: 'Error updating SubGroup', error: error.message });
    }
};

exports.deleteStudentFromSubGroup = async (req, res) => {
    try {
        const { subGroupId, studentUniqueId } = req.body;

        // Find the SubGroup by ID
        const subGroup = await SubGroup.findById(subGroupId);
        if (!subGroup) {
            return res.status(404).json({ message: 'SubGroup not found' });
        }

        // Remove the student from the students array
        subGroup.students = subGroup.students.filter(id => id !== studentUniqueId);

        await subGroup.save();
        res.status(200).json({ message: 'Student removed from SubGroup', subGroup });
    } catch (error) {
        res.status(400).json({ message: 'Error removing student', error: error.message });
    }
};
