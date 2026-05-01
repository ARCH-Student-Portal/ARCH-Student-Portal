const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth.middleware');
const {
    getProfile,
    getDashboard,
    getSections,
    getSectionStudents,
    getGradebook,
    updateGrades,
    getAttendance,
    markAttendance,
    getSchedule,
    getAnnouncements,
    postAnnouncement
} = require('../controllers/teacher.controller');

// all routes protected — must be a logged in teacher
router.use(verifyToken, authorizeRole('teacher'));

router.get('/profile', getProfile);
router.get('/dashboard', getDashboard);
router.get('/sections', getSections);
router.get('/sections/:sectionId/students', getSectionStudents);
router.get('/sections/:sectionId/gradebook', getGradebook);
router.patch('/sections/:sectionId/grades', updateGrades);
router.get('/sections/:sectionId/attendance', getAttendance);
router.post('/sections/:sectionId/attendance', markAttendance);
router.get('/schedule', getSchedule);
router.get('/announcements', getAnnouncements);
router.post('/announcements', postAnnouncement);

module.exports = router;