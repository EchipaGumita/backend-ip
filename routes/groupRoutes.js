const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// Route to create a new Group
router.post('/', groupController.createGroup);

// Route to add SubGroups to a Group
router.post('/add-subgroups', groupController.addSubGroupsToGroup);

// Route to get all Groups
router.get('/', groupController.getAllGroups);

// Route to get a Group by name
router.get('/:name', groupController.getGroupByName);

// Route to delete a Group by ID
router.delete('/:groupId', groupController.deleteGroup);

// Route to edit a Group
router.put('/:groupId', groupController.editGroup);

// Route to find students in a Group
router.get('/:groupId/students', groupController.findStudentsInGroup);

// Route to delete a SubGroup from a Group
router.post('/delete-subgroup', groupController.deleteSubGroupFromGroup);

// Route to delete a Student from a Group
router.post('/delete-student', groupController.deleteStudentFromGroup);

// Route to move student between subgroups
router.post('/move-student-to-subgroup', groupController.moveStudentToAnotherSubgroup);

// Route to move student from one group to another
router.post('/move-student-to-group', groupController.moveStudentToAnotherGroup);
module.exports = router;
