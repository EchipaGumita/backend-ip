require('dotenv').config(); // Load environment variables
const cron = require('node-cron');
const moment = require('moment');
const nodemailer = require('nodemailer');
const { exec } = require('child_process');
const path = require('path');
const Classroom = require('../models/classroom');
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
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// 3) Auto Backup Cron Job
cron.schedule('0 2 * * *', async () => {
  console.log('[CRON] Starting database backup...');
  try {
    // Create a timestamped backup file name
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const backupDir = path.join(__dirname, '../backups');
    const backupPath = path.join(backupDir, `backup-${timestamp}.gz`);

    // Create the backup directory if it doesn't exist
    require('fs').mkdirSync(backupDir, { recursive: true });

    // Command to back up the database
    const command = `mongodump --uri="${process.env.MONGO_URI}" --archive="${backupPath}" --gzip`;

    // Execute the backup command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('[CRON] Database backup failed:', error.message);
        return;
      }
      console.log('[CRON] Database backup completed:', backupPath);

      // Optionally, send an email notification after successful backup
      sendEmail(
        process.env.ADMIN_EMAIL,
        'Database Backup Successful',
        `The database backup was created successfully at ${timestamp}.\nBackup path: ${backupPath}`
      );
    });
  } catch (error) {
    console.error('[CRON] Error during backup process:', error);
  }
});

// Existing Cron Jobs for Notifications and Cleanup...

// 4) Notification Cron Job (daily at 5:00 PM)
cron.schedule('0 17 * * *', async () => {
  try {
    console.log('[CRON] Starting exam notifications for tomorrow...');

    const tomorrowStart = moment().add(1, 'days').startOf('day').toDate();
    const tomorrowEnd = moment().add(1, 'days').endOf('day').toDate();

    const tomorrowExams = await Exam.find({
      date: { $gte: tomorrowStart, $lt: tomorrowEnd },
    })
      .populate('group')
      .populate('classroom')
      .populate('mainProfessor')
      .populate('secondaryProfessor');

    if (!tomorrowExams.length) {
      console.log('[CRON] No exams found for tomorrow.');
      return;
    }

    const studentsExamsMap = {};
    for (const exam of tomorrowExams) {
      if (!exam.group) continue;
      const groupWithSubGroups = await Group.findById(exam.group._id).populate('subGroups');
      if (!groupWithSubGroups) continue;

      for (const subGroup of groupWithSubGroups.subGroups) {
        const subGroupDoc = await SubGroup.findById(subGroup._id);
        if (!subGroupDoc || !subGroupDoc.students) continue;

        const fetchedStudents = await Student.find({ uniqueId: { $in: subGroupDoc.students } });

        for (const student of fetchedStudents) {
          if (!student.email) continue;
          if (!studentsExamsMap[student.email]) {
            studentsExamsMap[student.email] = [];
          }
          studentsExamsMap[student.email].push(exam);
        }
      }
    }

    const emailPromises = Object.entries(studentsExamsMap).map(async ([email, exams]) => {
      let messageBody = 'Hello,\n\nYou have the following exams tomorrow:\n\n';

      for (const exam of exams) {
        const mainProfName = exam.mainProfessor
          ? `${exam.mainProfessor.firstName} ${exam.mainProfessor.lastName}`
          : 'N/A';
        const secondaryProfName = exam.secondaryProfessor
          ? `${exam.secondaryProfessor.firstName} ${exam.secondaryProfessor.lastName}`
          : 'N/A';
        const classroomName = exam.classroom?.name || 'N/A';

        messageBody += `- ${exam.subject}, at ${exam.hour}, classroom: ${classroomName}\n  Main Professor: ${mainProfName}\n  Secondary Professor: ${secondaryProfName}\n\n`;
      }

      messageBody += 'Good luck on your exams!\n';

      await sendEmail(email, 'Exam Notification for Tomorrow', messageBody);
      console.log(`[CRON] Email sent to: ${email}`);
    });

    await Promise.all(emailPromises);
    console.log('[CRON] Exam notifications sent successfully.');
  } catch (error) {
    console.error('[CRON] Error sending notifications:', error);
  }
});

// 5) Cleanup Cron Job (daily at 4:51 PM)
cron.schedule('51 16 * * *', async () => {
  try {
    console.log('[CRON] Cleaning up past exams...');

    const now = moment();

    const pastExams = await Exam.find({ date: { $lt: now.toDate() } });

    if (!pastExams.length) {
      console.log('[CRON] No past exams found.');
      return;
    }

    for (const exam of pastExams) {
      const classroom = await Classroom.findById(exam.classroom);
      if (classroom) {
        classroom.booked_slots = classroom.booked_slots.filter((slot) =>
          !moment(slot.date).isSame(moment(exam.date), 'minute')
        );
        await classroom.save();
        console.log(`[CRON] Released booked slot for classroom: ${classroom.name}`);
      }

      await Exam.findByIdAndDelete(exam._id);
      console.log(`[CRON] Deleted past exam: ${exam.subject}`);
    }

    console.log('[CRON] Past exams cleanup completed.');
  } catch (error) {
    console.error('[CRON] Error during past exams cleanup:', error);
  }
});
