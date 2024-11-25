const express = require('express');
const router = express.Router();
const professorController = require('../controllers/professorController');

router.post('/', professorController.createProfessor);
router.get('/', professorController.GetProfessors);
router.get('/:uniqueId', professorController.getProfessorByUniqueId);
router.put('/:uniqueId', professorController.updateProfessor);
router.delete('/:uniqueId', professorController.deleteProfessor);

module.exports = router;
