const express = require('express');
const router = express.Router();
const subGroupController = require('../controllers/subGroupController');

// Route to create a new SubGroup
router.post('/', subGroupController.createSubGroup);

// Route to add students to an existing SubGroup
router.post('/add-students', subGroupController.addStudentsToSubGroup);

// Route to get all SubGroups
router.get('/', subGroupController.getAllSubGroups);

// Route to get a SubGroup by name
router.get('/:name', subGroupController.getSubGroupByName);

// Route to delete a SubGroup by ID
router.delete('/:subGroupId', subGroupController.deleteSubGroup);

// Route to delete a student from a SubGroup
router.post('/delete-student', subGroupController.deleteStudentFromSubGroup);

// Route to edit a SubGroup
router.put('/edit/:subGroupId', subGroupController.editSubGroup);

module.exports = router;
