const express = require('express');
const router = express.Router();
const { createGroup, getGroups, addSubgroupToGroup } = require('../controllers/groupController');

// Create a new group
router.post('/groups', createGroup);

// Get all groups
router.get('/groups', getGroups);

// Add a subgroup to a group by subgroup ObjectId
router.post('/groups/add-subgroup', addSubgroupToGroup); // Changed to use a new endpoint for clarity

module.exports = router;
