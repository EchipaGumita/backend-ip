// aproveemail.js
const nodemailer = require('nodemailer');

// 1) Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true if you use port 465 (SSL)
  auth: {
    user: process.env.EMAIL_USER, // e.g.: your Gmail address
    pass: process.env.EMAIL_PASS, // App Password generated if you have 2FA
  },
});

// 2) Generic function to send an email with dynamic subject & message
const sendEmail = async (recipient, subject, message) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // the "from" address
      to: recipient,                // the student's or recipient's email
      subject,
      text: message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email trimis cu succes:', info.messageId);
  } catch (error) {
    console.error('Eroare la trimiterea emailului:', error);
  }
};

// 3) If you still want a specialized "approval email" function:
const sendApprovalEmail = async (studentEmail, examDetails) => {
  const messageBody = `
Salut,

Examenul la materia: ${examDetails.subject}
Data examen: ${examDetails.date}
Ora examen: ${examDetails.hour}
Sala: ${examDetails.classroom}
Profesor principal: ${examDetails.mainProfessor}
Profesor secundar: ${examDetails.secondaryProfessor}
Facultate: ${examDetails.faculty}
Grup: ${examDetails.group}

A fost aprobat cu succes!

Mult succes la examen!
`.trim();

  await sendEmail(studentEmail, 'Examen Aprobat', messageBody);
};

module.exports = {
  sendEmail,
  sendApprovalEmail,
};
