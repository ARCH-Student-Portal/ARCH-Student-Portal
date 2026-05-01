const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth.middleware');
const {
    getMyProfile,
    updateMyProfile,
    getMyEnrollments,
    getMyGPA,
    getMyAttendance,
    getMyTimetable
} = require('../controllers/student.controller');

router.use(verifyToken, authorizeRole('student'));

// GET /api/students/me
router.get('/me', getMyProfile);

// PUT /api/students/me
router.put('/me', updateMyProfile);

// GET /api/students/me/enrollments
router.get('/me/enrollments', getMyEnrollments);

// GET /api/students/me/gpa
router.get('/me/gpa', getMyGPA);

// GET /api/students/me/attendance
router.get('/me/attendance', getMyAttendance);

// GET /api/students/me/timetable
router.get('/me/timetable', getMyTimetable);

module.exports = router;
