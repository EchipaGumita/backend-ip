const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const studentRoutes = require('./routes/studentRoutes');
const subgroupRoutes = require('./routes/subGroupRoutes');
const groupRoutes = require('./routes/groupRoutes'); 
const professorRoutes = require('./routes/professorRoutes');
const authRoutes = require('./routes/authRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const examRoutes = require('./routes/examRoutes');
const examRequestRoutes = require('./routes/examRequestRoutes');
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.log("MongoDB connection error:", error));

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
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Docs available at http://localhost:${PORT}/docs`);
});
