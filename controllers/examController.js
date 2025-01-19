const Exam = require('../models/exam');
const moment = require('moment');
const Professor = require('../models/professor');
const Classroom = require('../models/classroom');
const Student = require('../models/student');
const SubGroup = require('../models/subGroup'); // Adjust path if necessary
const Group = require('../models/group');
const examRequest = require('../models/examRequest');
// Create a new exam
exports.createExam = async (req, res) => {
    try {
        const { subject, mainProfessor, secondaryProfessor, faculty, group, date, hour, duration, classroom } = req.body;
        console.log("Creating exam with data:", req.body);
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
            hour: parseInt(hour.split(':')[0], 10),
            minute: parseInt(hour.split(':')[1], 10),
        });
        
        // Validate the startTime to ensure it was set correctly
        if (!startTime.isValid()) {
            throw new Error('Invalid date or time format');
        }
        
        // Confirm the format of `startTime`
        console.log("Start time:", startTime.format('YYYY-MM-DD HH:mm:ss'));

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

exports.getUpcomingExams = async (req, res) => {
    try {
      const { limit = 5 } = req.query; // Allow setting a limit (default to 5)
  
      // Get the current date and time
      const now = moment().toDate();
  
      // Query for exams scheduled after the current time, sorted by date and hour
      const exams = await Exam.find({ date: { $gte: now } })
        .sort({ date: 1, hour: 1 }) // Sort by date and time
        .limit(parseInt(limit)) // Limit the number of results
        .populate('mainProfessor secondaryProfessor group classroom'); // Populate references for detailed information
  
      // If no exams are found
      if (!exams || exams.length === 0) {
        return res.status(404).json({ message: 'No upcoming exams found' });
      }
  
      // Return the upcoming exams
      res.status(200).json({ exams });
    } catch (error) {
      console.error('Error fetching upcoming exams:', error);
      res.status(500).json({ message: 'Error fetching upcoming exams', error: error.message });
    }
  };

  //get KPIs
  exports.getKPIs = async (req, res) => {
    try {
      // Total exams scheduled
      const totalExams = await Exam.countDocuments();
  
      // Exams today
      const todayStart = moment().startOf('day').toDate();
      const todayEnd = moment().endOf('day').toDate();
      const examsToday = await Exam.countDocuments({
        date: { $gte: todayStart, $lte: todayEnd },
      });
  
      // Exams this week
      const weekStart = moment().startOf('week').toDate();
      const weekEnd = moment().endOf('week').toDate();
      const examsThisWeek = await Exam.countDocuments({
        date: { $gte: weekStart, $lte: weekEnd },
      });
  
      // Average classroom utilization
      const classrooms = await Classroom.find();
      let totalUtilization = 0;
      classrooms.forEach((classroom) => {
        totalUtilization += classroom.booked_slots.length;
      });
      const averageUtilization =
        classrooms.length > 0
          ? (totalUtilization / classrooms.length).toFixed(2)
          : 0;
  
      // Pending exam requests
      const pendingRequests = await examRequest.countDocuments({ status: 'pending' });
  
      // Return all KPIs
      res.status(200).json({
        totalExams,
        examsToday,
        examsThisWeek,
        averageUtilization,
        pendingRequests,
      });
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      res.status(500).json({ message: 'Error fetching KPIs', error: error.message });
    }
  };
// Edit an existing exam
exports.updateExam = async (req, res) => {
    try {
      const { examId } = req.params;
      const updates = req.body;
  
      // Check if we need to update the classroom
      if (updates.classroom) {
        // Verify the classroom object ID exists, otherwise return an error
        if (!mongoose.Types.ObjectId.isValid(updates.classroom)) {
          return res.status(400).json({ message: 'Invalid classroom ID' });
        }
      }
  
      // Update the exam with the given updates (this will include the hour and/or classroom)
      const updatedExam = await Exam.findByIdAndUpdate(examId, updates, { new: true });
  
      if (!updatedExam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
  
      res.status(200).json({ message: 'Exam updated successfully', exam: updatedExam });
    } catch (error) {
      res.status(400).json({ message: 'Error updating exam', error: error.message });
    }
  };
  
// Delete an exam
exports.deleteExam = async (req, res) => {
    try {
        const { examId } = req.params;

        // Find the exam to get the classroom and time details
        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        // Find the classroom and remove the booked slot
        const classroom = await Classroom.findById(exam.classroom);
        if (classroom) {
            classroom.booked_slots = classroom.booked_slots.filter(slot => {
                return !(moment(slot.date).isSame(exam.date, 'day') &&
                         slot.startTime === exam.hour &&
                         moment(slot.endTime, 'HH:mm').isSame(moment(exam.date).add(exam.duration, 'minutes'), 'HH:mm'));
            });
            await classroom.save();
        }

        // Delete the exam
        await Exam.findByIdAndDelete(examId);
      
        res.status(200).json({ message: 'Exam and booked slot deleted successfully' });
    } catch (error) {
       
        res.status(400).json({ message: 'Error deleting exam', error: error.message });
    }
};

// Get all exams
exports.getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find().populate('mainProfessor secondaryProfessor group classroom');
        res.status(200).json({ exams });
    } catch (error) {
        res.status(400).json({ message: 'Error fetching exams', error: error.message });
    }
};
//Get exams by its id 
exports.getExamById = async (req, res) => {
    try {
        const { examId } = req.params;

        const exam = await Exam.findById(examId).populate('mainProfessor secondaryProfessor group classroom');
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        res.status(200).json({ exam });
    } catch (error) {
        res.status(400).json({ message: 'Error fetching exam', error: error.message });
    }
}

// Get exams by specific criteria
exports.getExamsByCriteria = async (req, res) => {
    try {
        const { faculty, group, date } = req.query;
        const exams = await Exam.find({ faculty, group, date }).populate('mainProfessor secondaryProfessor group classroom');

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
