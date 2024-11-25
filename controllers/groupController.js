const Group = require('../models/group');
const SubGroup = require('../models/subGroup');

// Create a new Group
exports.createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const newGroup = new Group({ name });
        await newGroup.save();
        res.status(201).json({ message: 'Group created successfully', group: newGroup });
    } catch (error) {
        res.status(400).json({ message: 'Error creating group', error: error.message });
    }
};

// Add SubGroups to a Group
exports.addSubGroupsToGroup = async (req, res) => {
    try {
        const { groupId, subGroupIds } = req.body;
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        group.subGroups.push(...subGroupIds);
        await group.save();
        res.status(200).json({ message: 'SubGroups added to group', group });
    } catch (error) {
        res.status(400).json({ message: 'Error adding subgroups', error: error.message });
    }
};

// Get all Groups
exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find().populate('subGroups'); // Populate subGroup details
        res.status(200).json({ groups });
    } catch (error) {
        res.status(400).json({ message: 'Error fetching groups', error: error.message });
    }
};

// Get a Group by name
exports.getGroupByName = async (req, res) => {
    try {
        const { name } = req.params;
        const group = await Group.findOne({ name }).populate('subGroups'); // Populate subGroup details
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json({ group });
    } catch (error) {
        res.status(400).json({ message: 'Error fetching group by name', error: error.message });
    }
};

// Delete a Group by ID
exports.deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findByIdAndDelete(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting group', error: error.message });
    }
};

// Edit a Group
exports.editGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name } = req.body;
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (name) {
            group.name = name;
        }
        await group.save();
        res.status(200).json({ message: 'Group updated successfully', group });
    } catch (error) {
        res.status(400).json({ message: 'Error updating group', error: error.message });
    }
};
// Find students in a Group
exports.findStudentsInGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        // Find the Group and populate its subGroups
        const group = await Group.findById(groupId).populate('subGroups');
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if there are subGroups
        if (!group.subGroups || group.subGroups.length === 0) {
            return res.status(200).json({ message: 'No subGroups in this group', students: [] });
        }

        // Extract all students from the subGroups
        const students = group.subGroups.flatMap(subGroup => subGroup.students);

        // Eliminate duplicates
        const uniqueStudents = [...new Set(students)];

        res.status(200).json({
            message: 'Students in group retrieved successfully',
            students: uniqueStudents,
        });
    } catch (error) {
        res.status(400).json({
            message: 'Error retrieving students in group',
            error: error.message,
        });
    }
};
//Delte a SubGroup from a Group
exports.deleteSubGroupFromGroup = async (req, res) => {
    try {
        const { groupId, subGroupId } = req.body;

        // Find the group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Remove the subGroupId from the group's subGroups array
        group.subGroups = group.subGroups.filter(id => id.toString() !== subGroupId);
        await group.save();

        res.status(200).json({
            message: 'SubGroup removed from Group successfully',
            group,
        });
    } catch (error) {
        res.status(400).json({
            message: 'Error removing SubGroup from Group',
            error: error.message,
        });
    }
};
// Delete a Student from a Group
exports.deleteStudentFromGroup = async (req, res) => {
    try {
        const { groupId, studentUniqueId } = req.body;

        // Find the group and populate its subGroups
        const group = await Group.findById(groupId).populate('subGroups');
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        let studentFound = false;

        // Iterate through the subGroups and remove the student
        for (const subGroup of group.subGroups) {
            const originalLength = subGroup.students.length;
            subGroup.students = subGroup.students.filter(studentId => studentId !== studentUniqueId);

            // Save the SubGroup only if changes were made
            if (subGroup.students.length !== originalLength) {
                studentFound = true;
                await subGroup.save();
            }
        }

        if (!studentFound) {
            return res.status(404).json({ message: 'Student not found in any SubGroup' });
        }

        res.status(200).json({ message: 'Student removed from Group successfully' });
    } catch (error) {
        res.status(400).json({
            message: 'Error removing Student from Group',
            error: error.message,
        });
    }
};
exports.moveStudentToAnotherSubgroup = async (req, res) => {
    try {
        const { studentUniqueId, sourceSubgroupId, targetSubgroupId, groupId } = req.body;

        // Validate that studentUniqueId is provided
        if (!studentUniqueId) {
            return res.status(400).json({ message: 'Student uniqueId is required' });
        }

        // Ensure studentUniqueId is a string
        const studentIdString = studentUniqueId.toString();

        // Find the group and populate the subgroups
        const group = await Group.findById(groupId).populate('subGroups');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Find the source and target subgroups
        const sourceSubgroup = group.subGroups.find(subgroup => subgroup._id.toString() === sourceSubgroupId);
        const targetSubgroup = group.subGroups.find(subgroup => subgroup._id.toString() === targetSubgroupId);

        if (!sourceSubgroup || !targetSubgroup) {
            return res.status(404).json({ message: 'Subgroup not found' });
        }

        // Check if the student exists in the source subgroup by matching uniqueId
        if (!sourceSubgroup.students.includes(studentIdString)) {
            return res.status(404).json({ message: 'Student not found in the source subgroup' });
        }

        // Remove student from the source subgroup
        sourceSubgroup.students = sourceSubgroup.students.filter(id => id !== studentIdString);
        await sourceSubgroup.save();

        // Check if the student already exists in the target subgroup to avoid duplicates
        if (!targetSubgroup.students.includes(studentIdString)) {
            // Add student to the target subgroup
            targetSubgroup.students.push(studentIdString);
            await targetSubgroup.save();

            res.status(200).json({ message: 'Student moved to another subgroup successfully' });
        } else {
            res.status(400).json({ message: 'Student already in the target subgroup' });
        }

    } catch (error) {
        res.status(400).json({ message: 'Error moving student', error: error.message });
    }
};




// Move student from one group to another
exports.moveStudentToAnotherGroup = async (req, res) => {
    try {
        const { studentUniqueId, sourceGroupId, targetGroupId } = req.body;

        // Find both source and target groups
        const sourceGroup = await Group.findById(sourceGroupId).populate('subGroups');
        const targetGroup = await Group.findById(targetGroupId).populate('subGroups');

        if (!sourceGroup || !targetGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Find the student in the source group subgroups
        let studentFound = false;
        let studentSubgroup;

        for (let subgroup of sourceGroup.subGroups) {
            const studentIndex = subgroup.students.indexOf(studentUniqueId);
            if (studentIndex !== -1) {
                // Remove student from the source subgroup
                subgroup.students.splice(studentIndex, 1);
                await subgroup.save();
                studentFound = true;
                studentSubgroup = subgroup; // Remember the subgroup where the student was
                break;
            }
        }

        if (!studentFound) {
            return res.status(404).json({ message: 'Student not found in the source group' });
        }

        // Find the first subgroup of the target group to add the student to
        const targetSubgroup = targetGroup.subGroups[0]; // Modify this to select the appropriate subgroup if needed
        targetSubgroup.students.push(studentUniqueId);
        await targetSubgroup.save();

        res.status(200).json({ message: 'Student moved to another group successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error moving student to another group', error: error.message });
    }
};
