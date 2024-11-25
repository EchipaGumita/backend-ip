const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.post('/', studentController.createStudent);
router.get('/', studentController.getAllStudents);
router.get('/:uniqueId', studentController.getStudentByUniqueId);
router.put('/:uniqueId/password', studentController.updateStudentPassword);
router.put('/:uniqueId', studentController.updateStudent);
router.delete('/:uniqueId', studentController.deleteStudent);
router.get('/find/faculty', studentController.findStudentsByFaculty);
router.get('/find/major', studentController.findStudentsByMajor);
router.get('/find/year', studentController.findStudentsByYear);

module.exports = router;
