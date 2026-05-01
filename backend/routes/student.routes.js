const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth.middleware');
const {
    getProfile,
    updateProfile,
    getCourses,
    getGrades,
    getAttendance,
    getGPA,
    getAnnouncements,
    getTranscript,
    getTimetable
} = require('../controllers/student.controller');

// all routes protected — must be a logged in student
router.use(verifyToken, authorizeRole('student'));

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.get('/courses', getCourses);
router.get('/grades', getGrades);
router.get('/attendance', getAttendance);
router.get('/gpa', getGPA);
router.get('/announcements', getAnnouncements);
router.get('/transcript', getTranscript);
router.get('/timetable', getTimetable);

module.exports = router;