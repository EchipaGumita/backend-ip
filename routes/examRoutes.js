const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');

const examController = require('../controllers/examController');
const Professor = require('../models/professor');
const Classroom = require('../models/classroom');
const Student = require('../models/student');
const SubGroup = require('../models/subGroup'); // Adjust path if necessary
const Group = require('../models/group');
const Exam = require('../models/exam');
// Create a new exam
router.post('/', examController.createExam);

// Edit an existing exam
router.put('/:examId', examController.updateExam);

// Delete an exam
router.delete('/:examId', examController.deleteExam);

// Get all exams
router.get('/', examController.getAllExams);
router.get('/:examId', examController.getExamById);
// Get exams by specific criteria (e.g., faculty, group, date)
router.get('/search', examController.getExamsByCriteria);

// Get exams for a student
router.get('/student/:studentUniqueId/exams', examController.getStudentExams);

// Get exams for a subgroup
router.get('/subgroup/:subgroupId/exams', examController.getSubgroupExams);

// Get exams for a group
router.get('/group/:groupId/exams', examController.getGroupExams);

router.get('/:studentUniqueId/pdf', async (req, res) => {
    try {
        const { studentUniqueId } = req.params;

        // Fetch exams for the student
        const subgroup = await SubGroup.findOne({ students: studentUniqueId });
        if (!subgroup) {
            return res.status(404).json({ message: 'Student not found in any subgroup' });
        }

        const group = await Group.findOne({ subGroups: subgroup._id });
        if (!group) {
            return res.status(404).json({ message: 'Group not found for this student\'s subgroup' });
        }

        const exams = await Exam.find({ group: group._id })
            .populate('mainProfessor', 'firstName lastName') // Populate firstName and lastName
            .populate('secondaryProfessor', 'firstName lastName') // Populate firstName and lastName
            .populate('classroom', 'name'); // Populate classroom with its name

        if (!exams || exams.length === 0) {
            return res.status(404).json({ message: 'No exams found for this student\'s group' });
        }

        // Generate PDF
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument();
        const fileName = `Exam_Schedule_${studentUniqueId}.pdf`;

        // Set response headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        doc.pipe(res);

        // Add title
        doc.fontSize(18).text(`Exam Schedule for Student ID: ${studentUniqueId}`, { align: 'center' });
        doc.moveDown();

        // Add table headers
        doc.fontSize(12).text('Date        | Hour   | Classroom      | Subject     | Main Professor      | Secondary Professor', { underline: true });
        doc.moveDown(0.5);

        // Add each exam
        exams.forEach((exam) => {
            const examDate = exam.date ? new Date(exam.date).toLocaleDateString() : 'N/A';
            const examHour = exam.hour || 'N/A';
            const classroomName = exam.classroom?.name || 'N/A';
            const subject = exam.subject || 'N/A';
            const mainProfessorName = exam.mainProfessor
                ? `${exam.mainProfessor.firstName} ${exam.mainProfessor.lastName}`
                : 'N/A';
            const secondaryProfessorName = exam.secondaryProfessor
                ? `${exam.secondaryProfessor.firstName} ${exam.secondaryProfessor.lastName}`
                : 'N/A';

            doc.text(`${examDate} | ${examHour} | ${classroomName} | ${subject} | ${mainProfessorName} | ${secondaryProfessorName}`);
        });

        // End and send PDF
        doc.end();
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ message: 'Error generating PDF', error: error.message });
    }
});
module.exports = router;
