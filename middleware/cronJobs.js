// cronJobs.js
require('dotenv').config(); // Make sure to load .env if you haven't in a parent file
const cron = require('node-cron');
const moment = require('moment');
const nodemailer = require('nodemailer');

const Exam = require('../models/exam');
const Group = require('../models/group');
const SubGroup = require('../models/subGroup');
const Student = require('../models/student');

// 1) Create the Nodemailer transporter with credentials from .env
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true if using SSL/port 465
  auth: {
    user: process.env.EMAIL_USER, // e.g. your_email@gmail.com
    pass: process.env.EMAIL_PASS, // your App Password if 2FA is on
  },
});

// 2) Reusable function to send an email
async function sendEmail(to, subject, text) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // The "from" address
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email trimis cu succes:', info.messageId);
  } catch (error) {
    console.error('Eroare la trimiterea emailului:', error);
  }
}

// 3) Set up the cron job (every day at 21:10)
cron.schedule('0 17 * * *', async () => {
  try {
    console.log('[CRON] Încep verificarea examenelor pentru mâine...');

    // 3.1) Determine tomorrow's start/end as Date objects
    const tomorrowStart = moment().add(1, 'days').startOf('day').toDate();
    const tomorrowEnd = moment().add(1, 'days').endOf('day').toDate();

    // 3.2) Find all exams within [tomorrowStart, tomorrowEnd)
    const tomorrowExams = await Exam.find({
      date: {
        $gte: tomorrowStart,
        $lt: tomorrowEnd,
      }
    })
      .populate('group')
      .populate('classroom')
      .populate('mainProfessor')
      .populate('secondaryProfessor');

    if (!tomorrowExams || tomorrowExams.length === 0) {
      console.log('[CRON] Niciun examen pentru mâine.');
      return;
    }

    // 3.3) Build a dictionary: { studentEmail: [exam, exam, ...] }
    const studentsExamsMap = {};

    for (const exam of tomorrowExams) {
      if (!exam.group) continue;

      const groupWithSubGroups = await Group.findById(exam.group._id).populate('subGroups');
      if (!groupWithSubGroups) continue;

      for (const subGroup of groupWithSubGroups.subGroups) {
        const subGroupDoc = await SubGroup.findById(subGroup._id);
        if (!subGroupDoc || !subGroupDoc.students) continue;

        // Fetch the actual Student docs
        const fetchedStudents = await Student.find({
          uniqueId: { $in: subGroupDoc.students },
        });

        // Add each exam to the student's email array
        for (const stud of fetchedStudents) {
          if (!stud.email) continue;
          if (!studentsExamsMap[stud.email]) {
            studentsExamsMap[stud.email] = [];
          }
          studentsExamsMap[stud.email].push(exam);
        }
      }
    }

    // 3.4) Send one email per student, listing all tomorrow’s exams
    const emailPromises = Object.entries(studentsExamsMap).map(async ([email, exams]) => {
      let messageBody = 'Bună,\n\nMâine ai următoarele examene:\n\n';

      for (const ex of exams) {
        const mainProfName = ex.mainProfessor
          ? `${ex.mainProfessor.firstName} ${ex.mainProfessor.lastName}`
          : 'N/A';
        const secondaryProfName = ex.secondaryProfessor
          ? `${ex.secondaryProfessor.firstName} ${ex.secondaryProfessor.lastName}`
          : 'N/A';
        const classroomName = ex.classroom?.name || 'N/A';

        messageBody += `- ${ex.subject}, ora: ${ex.hour}, sală: ${classroomName}\n  Profesor principal: ${mainProfName}\n  Profesor secundar: ${secondaryProfName}\n\n`;
      }

      messageBody += 'Mult succes la examene!\n';

      await sendEmail(email, 'Examen(Ex) Mâine - Notificare', messageBody);
      console.log(`[CRON] Email trimis către: ${email}`);
    });

    await Promise.all(emailPromises);
    console.log('[CRON] Notificări examene pentru mâine - finalizat.');
  } catch (error) {
    console.error('[CRON] Eroare la trimiterea notificărilor:', error);
  }
});
