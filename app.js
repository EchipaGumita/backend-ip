const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('./middleware/cronJobs.js'); // Run the cron jobs
require('dotenv').config();
const app = express();
const studentRoutes = require('./routes/studentRoutes');
const subgroupRoutes = require('./routes/subGroupRoutes');
const groupRoutes = require('./routes/groupRoutes'); 
const professorRoutes = require('./routes/professorRoutes');
const authRoutes = require('./routes/authRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const examRoutes = require('./routes/examRoutes');
const examRequestRoutes = require('./routes/examRequestRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes.js');
const backupRoutes = require('./routes/backupRoutes'); // Add this line
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from the frontend
    methods: 'GET, POST, PUT, DELETE', // Allow specific methods
    allowedHeaders: 'Content-Type, Authorization', // Allow custom headers
    credentials: true, // If you need credentials (cookies, authorization headers)
}));
app.options('*', cors()); // Enable pre-flight
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
   .then(() => {
       console.log("MongoDB connected");
   })
   .catch((error) => {
       console.error("MongoDB connection error:", error);
       process.exit(1); // Exit process with failure
   });
// Middleware setup
app.use(bodyParser.json());
app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'api-docs.html'));
});
// Routes setup
app.use('/api/students', studentRoutes); // Only the student routes
app.use('/api/subgroup', subgroupRoutes); // Only the subgroup routes
app.use('/api/groups', groupRoutes); // Only the group routes
app.use('/api/professor', professorRoutes); // Only the professor routes
app.use('/api/auth', authRoutes); // Only the auth routes
app.use('/api/classroom', classroomRoutes); // Only the classroom routes
app.use('/api/exam', examRoutes); // Only the exam routes
app.use('/api/exam-request', examRequestRoutes); // Only the exam request routes
app.use('/api/analytics', analyticsRoutes); // Only the analytics routes
app.use('/api/backup', backupRoutes);
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Docs available at http://localhost:${PORT}/docs`);
});
