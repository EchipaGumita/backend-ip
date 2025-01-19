const ExamRequest = require('../models/examRequest');
const moment = require('moment');
const Classroom = require('../models/classroom');
const SubGroup = require('../models/subGroup');
const Student = require('../models/student');
const Professor = require('../models/professor');
const Group = require('../models/group');
const Exam = require('../models/exam');  // Assuming you already have an Exam model
const {sendApprovalEmail} = require('../middleware/aproveemail');  // Import the sendApprovalEmail function
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
  
      // 1) Find the exam request
      const request = await ExamRequest.findById(requestId).populate('classroom');
      if (!request) {
        return res.status(404).json({ message: 'Exam request not found' });
      }
  
      // 2) Update approval status and reason
      request.approved = approved;
      request.reason = reason || '';
  
      // 3) If approved, create the exam
      if (approved) {
        const { subject, examDate, examDuration, hour, classroom, studentUniqueId } = request;
  
        // Check required fields
        if (!subject || !examDate || !examDuration || !hour || !classroom) {
          return res.status(400).json({
            message: 'Missing required fields to create the exam'
          });
        }
  
        // 3.1) Find professors
        const mainProfessorDoc = await Professor.findById(request.mainProfessor);
        const secondaryProfessorDoc = await Professor.findById(request.secondaryProfessor);
  
        if (!mainProfessorDoc) {
          return res.status(404).json({ message: 'Main professor not found' });
        }
  
        // 3.2) Create the exam in DB
        const exam = new Exam({
          subject,
          mainProfessor: mainProfessorDoc._id,
          secondaryProfessor: secondaryProfessorDoc ? secondaryProfessorDoc._id : null,
          faculty: request.faculty,
          group: request.group,
          date: examDate,
          hour,
          duration: examDuration,
          classroom: classroom._id,
        });
        await exam.save();
  
        // 3.3) Book the classroom
        const startTime = moment(`${examDate} ${hour}`, 'YYYY-MM-DD HH:mm').toDate();
        const endTime = moment(startTime).add(examDuration, 'minutes').toDate();
  
        const isBooked = classroom.booked_slots.some(slot => {
          const slotStart = new Date(slot.date);
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotStart.getMinutes() + slot.endTime);
          return (startTime >= slotStart && startTime <= slotEnd) ||
                 (endTime >= slotStart && endTime <= slotEnd);
        });
  
        if (isBooked) {
          return res.status(400).json({ message: 'Classroom is already booked for this time slot' });
        }
  
        classroom.booked_slots.push({
          date: examDate,
          startTime: moment(startTime).format('HH:mm'),
          endTime: moment(endTime).format('HH:mm')
        });
        await classroom.save();
  
        // 3.4) Fetch group + subgroups to get students
        const groupWithSubGroups = await Group.findById(request.group).populate('subGroups');
        if (!groupWithSubGroups) {
          console.warn('Group not found or has no subGroups.');
        }
  
        const students = [];
        if (groupWithSubGroups && groupWithSubGroups.subGroups) {
          for (const subGroup of groupWithSubGroups.subGroups) {
            const subGroupWithStudents = await SubGroup.findById(subGroup._id);
            if (subGroupWithStudents && subGroupWithStudents.students) {
              const fetchedStudents = await Student.find({
                uniqueId: { $in: subGroupWithStudents.students },
              });
              students.push(...fetchedStudents);
            }
          }
        }
  
        // 3.5) Also fetch the groupDoc (for group name)
        const groupDoc = await Group.findById(request.group);
  
        // 3.6) Build exam details for the approval email
        const examDetails = {
          subject,
          date: examDate,
          hour,
          duration: examDuration,
          faculty: request.faculty,
          location: `${classroom.building || ''} ${classroom.name || ''}`.trim(), // Combine classroom and building
          mainProfessor: mainProfessorDoc
            ? `${mainProfessorDoc.firstName} ${mainProfessorDoc.lastName}`
            : 'N/A',
          secondaryProfessor: secondaryProfessorDoc
            ? `${secondaryProfessorDoc.firstName} ${secondaryProfessorDoc.lastName}`
            : 'N/A',
          group: groupDoc ? groupDoc.name : 'N/A',
        };
  
        // 3.7) Send approval emails to each student
        for (const student of students) {
          if (student && student.email) {
            try {
              await sendApprovalEmail(student.email, examDetails);
              console.log(`Email sent to: ${student.email}`);
            } catch (error) {
              console.error(`Failed to send email to ${student.email}:`, error);
            }
          } else {
            console.warn(`Skipping student without email: ${JSON.stringify(student)}`);
          }
        }
      }
  
      // 4) Save the updated request and remove it
      await request.save();
      await ExamRequest.findByIdAndDelete(requestId);
  
      // 5) Respond to client
      res.status(200).json({
        message: `Exam request ${approved ? 'approved' : 'denied'}`,
        request
      });
    } catch (error) {
      console.error('Error handling exam request:', error);
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
