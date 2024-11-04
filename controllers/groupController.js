    const mongoose = require('mongoose');
    const Group = require('../models/group');
    const Subgroup = require('../models/subgroup'); // Import the Subgroup model

    // Create a new group
    const createGroup = async (req, res) => {
        try {
            const group = new Group(req.body);
            await group.save();
            res.status(201).json(group);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    };

    // Get all groups
    const getGroups = async (req, res) => {
        try {
            const groups = await Group.find().populate('subgroups'); // Populate to get subgroup details
            res.status(200).json(groups);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    // Add a subgroup to a group by both ObjectIds
    const addSubgroupToGroup = async (req, res) => {
        const { groupId, subgroupId } = req.body; // Expecting both IDs in the request body
    
        try {
            const group = await Group.findById(groupId); // Find group by ObjectId
    
            if (!group) {
                return res.status(404).json({ message: 'Group not found' });
            }
    
            // Check if subgroup already exists in the group
            if (group.subgroups.includes(subgroupId)) {
                return res.status(400).json({ message: 'Subgroup already exists in this group' });
            }
    
            // Validate subgroupId and convert it to ObjectId
            if (!mongoose.Types.ObjectId.isValid(subgroupId)) {
                return res.status(400).json({ message: 'Invalid subgroup ID' });
            }
    
            // Add the subgroup ID to the group's subgroups array
            group.subgroups.push(mongoose.Types.ObjectId(subgroupId)); // Use ObjectId to add
            await group.save();
    
            res.status(200).json({ message: 'Subgroup added to group', group });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    module.exports = { createGroup, getGroups, addSubgroupToGroup };
