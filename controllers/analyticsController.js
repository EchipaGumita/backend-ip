const Classroom = require('../models/classroom');
const Professor = require('../models/professor');
const Exam = require('../models/exam');
const moment = require('moment');

// Get Classroom Utilization Analytics
exports.getClassroomUtilization = async (req, res) => {
  try {
    const classrooms = await Classroom.find();
    const utilizationData = [];

    for (const classroom of classrooms) {
      const exams = await Exam.find({ classroom: classroom._id });
      let totalBookedHours = 0;

      exams.forEach((exam) => {
        const duration = moment.duration(exam.duration, 'minutes').asHours();
        totalBookedHours += duration;
      });

      const totalAvailableHours = 8 * 5; // Adjust as needed
      const utilizationPercentage = ((totalBookedHours / totalAvailableHours) * 100).toFixed(2);

      utilizationData.push({
        classroom: classroom.name,
        totalBookedHours,
        utilizationPercentage,
      });
    }

    res.json(utilizationData);
  } catch (error) {
    console.error('Error fetching classroom utilization:', error);
    res.status(500).json({ error: 'Failed to fetch utilization data.' });
  }
};

// Get Professor Workload Analytics
exports.getProfessorWorkload = async (req, res) => {
  try {
    const professors = await Professor.find();
    const workloadData = [];

    for (const professor of professors) {
      const exams = await Exam.find({
        $or: [{ mainProfessor: professor._id }, { secondaryProfessor: professor._id }],
      });

      const totalExams = exams.length;
      const totalHours = exams.reduce((sum, exam) => sum + exam.duration / 60, 0);

      workloadData.push({
        professor: `${professor.firstName} ${professor.lastName}`,
        totalExams,
        totalHours,
      });
    }

    res.json(workloadData);
  } catch (error) {
    console.error('Error fetching professor workload:', error);
    res.status(500).json({ error: 'Failed to fetch workload data.' });
  }
};
