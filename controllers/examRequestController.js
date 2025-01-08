const ExamRequest = require('../models/examRequest');
const moment = require('moment');
const Classroom = require('../models/classroom');
const Professor = require('../models/professor');
const Group = require('../models/group');
const Exam = require('../models/exam');  // Assuming you already have an Exam model

// Create a new exam request
exports.createExamRequest = async (req, res) => {
    try {
        const { studentUniqueId, subject, examDate, examDuration, classroom, hour, mainProfessor, secondaryProfessor, faculty, group } = req.body;

        // Check if the classroom is available at the specified date and hour
        const classroomDoc = await Classroom.findById(classroom);
        if (!classroomDoc) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Check if the classroom is already booked for the given date and hour
        const isAvailable = !classroomDoc.booked_dates.some(booked => booked.date === examDate && booked.hour === hour);
        if (!isAvailable) {
            return res.status(400).json({ message: 'Classroom is already booked for this date and hour' });
        }

        // Find the group
        const groupDoc = await Group.findById(group);
        if (!groupDoc) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Create the exam request
        const newRequest = new ExamRequest({
            studentUniqueId,
            subject,
            examDate,
            examDuration,
            classroom,
            hour,
            mainProfessor,
            secondaryProfessor,
            faculty,
            group
        });

        await newRequest.save();
        res.status(201).json({ message: 'Exam request created successfully', request: newRequest });
    } catch (error) {
        res.status(400).json({ message: 'Error creating exam request', error: error.message });
    }
};

// Approve or deny an exam request
exports.handleExamRequest = async (req, res) => {
    try {
        const { requestId } = req.params;  // Get the requestId from route params
        const { approved, reason } = req.body;

        // Find the exam request by ID
        const request = await ExamRequest.findById(requestId).populate('classroom');
        if (!request) {
            return res.status(404).json({ message: 'Exam request not found' });
        }

        // Update the request with the approval status and reason
        request.approved = approved;
        request.reason = reason || '';

        // If the request is approved, proceed with creating the exam
        if (approved) {
            const { subject, examDate, examDuration, hour, classroom, studentUniqueId } = request;

            // Ensure the required fields are provided to create the exam
            if (!subject || !examDate || !examDuration || !hour || !classroom) {
                return res.status(400).json({
                    message: 'Missing required fields to create the exam'
                });
            }

            // Find professors (main and secondary)
            const mainProfessor = await Professor.findOne({ _id: request.mainProfessor });
            const secondaryProfessor = await Professor.findOne({ _id: request.secondaryProfessor });

            if (!mainProfessor) {
                return res.status(404).json({ message: 'Main professor not found' });
            }

            // Create the exam
            const exam = new Exam({
                subject,
                mainProfessor: mainProfessor._id,
                secondaryProfessor: secondaryProfessor ? secondaryProfessor._id : null,
                faculty: request.faculty,
                group: request.group,
                date: examDate,
                hour: hour,
                duration: examDuration,
                classroom: classroom._id,
            });

            await exam.save();

            // Calculate start time using moment (parse the hour properly)
            const startTime = moment(`${examDate} ${hour}`, 'YYYY-MM-DD hh:mm A').toDate();

            // Calculate end time using moment (add duration in minutes)
            const endTime = moment(startTime).add(examDuration, 'minutes').toDate();

            // Check if the classroom is already booked for this time slot
            const isBooked = classroom.booked_slots.some(slot => {
                const slotStart = new Date(slot.date);
                const slotEnd = new Date(slotStart);
                slotEnd.setMinutes(slotStart.getMinutes() + slot.endTime);  // Adjust this line

                return (startTime >= slotStart && startTime <= slotEnd) || (endTime >= slotStart && endTime <= slotEnd);
            });

            if (isBooked) {
                return res.status(400).json({ message: 'Classroom is already booked for this time slot' });
            }

            // Add the new booking to the booked slots
            classroom.booked_slots.push({ date: examDate, startTime: moment(startTime).format('HH:mm'), endTime: moment(endTime).format('HH:mm') });
            await classroom.save();
        }

        // Save the updated exam request
        await request.save();

        // Delete the exam request after processing
        await ExamRequest.findByIdAndDelete(requestId);

        res.status(200).json({
            message: `Exam request ${approved ? 'approved' : 'denied'}`,
            request
        });
    } catch (error) {
        res.status(400).json({ message: 'Error handling exam request', error: error.message });
    }
};
// Get all exam requests
exports.getAllExamRequests = async (req, res) => {
    try {
        const requests = await ExamRequest.find().populate('classroom').populate('mainProfessor').populate('secondaryProfessor').populate('group');
        res.status(200).json({ requests });
    } catch (error) {
        res.status(400).json({ message: 'Error fetching exam requests', error: error.message });
    }
};
exports.getExamRequestsByFilter = async (req, res) => {
    try {
        const { studentUniqueId, group, subject } = req.query; // Extract query parameters

        // Build a dynamic filter object
        const filter = {};
        if (studentUniqueId) filter.studentUniqueId = studentUniqueId;
        if (group) filter.group = group;
        if (subject) filter.subject = subject;

        // Find exam requests matching the filter
        const requests = await ExamRequest.find(filter)
            .populate('classroom')
            .populate('mainProfessor')
            .populate('secondaryProfessor')
            .populate('group');

        // Return the filtered requests
        res.status(200).json({ requests });
    } catch (error) {
        res.status(400).json({ message: 'Error fetching filtered exam requests', error: error.message });
    }
};
