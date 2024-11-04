const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
require('dotenv').config();

const groupRoutes = require('./routes/groupRoutes');
const studentRoutes = require('./routes/studentRoutes');
const examRoutes = require('./routes/examRoutes');
const professorRoutes = require('./routes/professorRoutes');
const authRoutes = require('./routes/authRoutes'); // Google OAuth routes
const examRequestRoutes = require('./routes/examRequestRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const subgroupRoutes = require('./routes/subgroupRoutes');
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.log("MongoDB connection error:", error));

// Middleware setup
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Initialize Passport and session for authentication
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let student = await Student.findOne({ email: profile.emails[0].value });
      if (!student) {
        student = new Student({
          student_id: profile.id,
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
          email: profile.emails[0].value,
          password: profile.id,
        });
        await student.save();
      }
      done(null, student);
    } catch (error) {
      done(error, null);
    }
  }
));

// Serialize and deserialize student information
passport.serializeUser((student, done) => {
  done(null, student.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const student = await Student.findById(id);
    done(null, student);
  } catch (error) {
    done(error, null);
  }
});

// Routes setup
app.use('/api', groupRoutes);
app.use('/api', studentRoutes);
app.use('/api', examRoutes);
app.use('/api', professorRoutes);
app.use('/api', examRequestRoutes); 
app.use('/api', authRoutes);
app.use('/api', classroomRoutes);
app.use(authRoutes);  // Add this line for Google OAuth routes
app.use('/api', subgroupRoutes);
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
