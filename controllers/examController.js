const Exam = require('../models/exam');

const moment = require('moment');
const Professor = require('../models/professor');
const Classroom = require('../models/classroom');
const Student = require('../models/student');
const SubGroup = require('../models/subGroup'); // Adjust path if necessary
const Group = require('../models/group');

// Create a new exam
exports.createExam = async (req, res) => {
    try {
        const { subject, mainProfessor, secondaryProfessor, faculty, group, date, hour, duration, classroom } = req.body;

        // Check if professors exist
        const mainProf = await Professor.findById(mainProfessor);
        if (!mainProf) return res.status(404).json({ message: 'Main professor not found' });

        const secondaryProf = secondaryProfessor ? await Professor.findById(secondaryProfessor) : null;
        if (secondaryProfessor && !secondaryProf) return res.status(404).json({ message: 'Secondary professor not found' });

        // Check if classroom exists
        const classroomFound = await Classroom.findById(classroom);
        if (!classroomFound) return res.status(404).json({ message: 'Classroom not found' });

        // Convert the provided hour and date into a start and end time
        const startTime = moment(date).set({
            hour: parseInt(hour.split(':')[0]),
            minute: parseInt(hour.split(':')[1].split(' ')[0]),
        });

        const endTime = moment(startTime).add(duration, 'minutes');

        // Check if the classroom is already booked for this time slot
        const isBooked = classroomFound.booked_slots.some(slot => {
            return (
                (moment(slot.date).isSame(startTime, 'day') && 
                ((moment(slot.startTime).isBefore(endTime) && moment(slot.endTime).isAfter(startTime))))
            );
        });

        if (isBooked) {
            return res.status(400).json({ message: 'Classroom is already booked for this time slot' });
        }

        // Add the booked slot to the classroom's booked slots
        classroomFound.booked_slots.push({
            date: startTime.toDate(),
            startTime: startTime.format('HH:mm'),
            endTime: endTime.format('HH:mm')
        });
        await classroomFound.save();

        // Create the exam
        const exam = new Exam({
            subject,
            mainProfessor,
            secondaryProfessor,
            faculty,
            group,
            date: startTime.toDate(),
            hour,
            duration,
            classroom
        });

        await exam.save();

        res.status(201).json({ message: 'Exam created and classroom booked successfully', exam });
    } catch (error) {
        res.status(400).json({ message: 'Error creating exam', error: error.message });
    }
};

// Edit an existing exam
exports.updateExam = async (req, res) => {
    try {
        const { examId } = req.params;
        const updates = req.body;

        const updatedExam = await Exam.findByIdAndUpdate(examId, updates, { new: true });
        if (!updatedExam) return res.status(404).json({ message: 'Exam not found' });

        res.status(200).json({ message: 'Exam updated successfully', exam: updatedExam });
    } catch (error) {
        res.status(400).json({ message: 'Error updating exam', error: error.message });
    }
};

// Delete an exam
exports.deleteExam = async (req, res) => {
    try {
        const { examId } = req.params;

        const deletedExam = await Exam.findByIdAndDelete(examId);
        if (!deletedExam) return res.status(404).json({ message: 'Exam not found' });

        res.status(200).json({ message: 'Exam deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting exam', error: error.message });
    }
};

// Get all exams
exports.getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find().populate('mainProfessor secondaryProfessor classroom');
        res.status(200).json({ exams });
    } catch (error) {
        res.status(400).json({ message: 'Error fetching exams', error: error.message });
    }
};

// Get exams by specific criteria
exports.getExamsByCriteria = async (req, res) => {
    try {
        const { faculty, group, date } = req.query;
        const exams = await Exam.find({ faculty, group, date }).populate('mainProfessor secondaryProfessor classroom');

        if (exams.length === 0) {
            return res.status(404).json({ message: 'No exams found for the given criteria' });
        }

        res.status(200).json({ exams });
    } catch (error) {
        res.status(400).json({ message: 'Error fetching exams by criteria', error: error.message });
    }
};
exports.getStudentExams = async (req, res) => {
    try {
        const { studentUniqueId } = req.params;  // Get the student ID from the URL

        console.log("Fetching exams for student with ID:", studentUniqueId);

        // Step 1: Find the SubGroup that contains the student by uniqueId
        const subgroup = await SubGroup.findOne({ students: studentUniqueId });

        if (!subgroup) {
            return res.status(404).json({ message: 'Student not found in any subgroup' });
        }

        console.log("Subgroup found:", subgroup); // Log the found subgroup

        // Step 2: Find the Group that contains this SubGroup
        const group = await Group.findOne({ subGroups: subgroup._id });

        if (!group) {
            return res.status(404).json({ message: 'Group not found for this student\'s subgroup' });
        }

        console.log("Group found:", group); // Log the found group

        // Step 3: Find all exams for the group
        const exams = await Exam.find({ group: group._id });

        if (!exams || exams.length === 0) {
            return res.status(404).json({ message: 'No exams found for this student\'s group' });
        }

        // Step 4: Return the exams
        res.status(200).json({ exams });
    } catch (error) {
        console.error("Error fetching student exams:", error);
        res.status(500).json({ message: 'Error fetching student exams', error: error.message });
    }
};
// Get a subgroup's exams
exports.getSubgroupExams = async (req, res) => {
    try {
        const { subgroupId } = req.params;  // Get the subgroup ID from the URL

        console.log("Fetching exams for subgroup with ID:", subgroupId);

        // Step 1: Find the SubGroup by its ID
        const subgroup = await SubGroup.findById(subgroupId);

        if (!subgroup) {
            return res.status(404).json({ message: 'Subgroup not found' });
        }

        console.log("Subgroup found:", subgroup); // Log the found subgroup

        // Step 2: Find the Group that contains this SubGroup
        const group = await Group.findOne({ subGroups: subgroup._id });

        if (!group) {
            return res.status(404).json({ message: 'Group not found for this subgroup' });
        }

        console.log("Group found:", group); // Log the found group

        // Step 3: Find all exams for the group
        const exams = await Exam.find({ group: group._id });

        if (!exams || exams.length === 0) {
            return res.status(404).json({ message: 'No exams found for this subgroup\'s group' });
        }

        // Step 4: Return the exams
        res.status(200).json({ exams });
    } catch (error) {
        console.error("Error fetching subgroup exams:", error);
        res.status(500).json({ message: "Error fetching subgroup's exams", error: error.message });
    }
};

// Get a group's exams
exports.getGroupExams = async (req, res) => {
    try {
        const { groupId } = req.params;  // Get the group ID from the URL

        console.log("Fetching exams for group with ID:", groupId);

        // Step 1: Find the Group by its ID
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        console.log("Group found:", group); // Log the found group

        // Step 2: Find all exams for the group
        const exams = await Exam.find({ group: group._id });

        if (!exams || exams.length === 0) {
            return res.status(404).json({ message: 'No exams found for this group' });
        }

        // Step 3: Return the exams
        res.status(200).json({ exams });
    } catch (error) {
        console.error("Error fetching group exams:", error);
        res.status(500).json({ message: "Error fetching group's exams", error: error.message });
    }
};