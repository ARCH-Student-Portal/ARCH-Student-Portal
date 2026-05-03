const express = require('express');
const router = express.Router();

const { verifyToken, authorizeRole } = require('../middleware/auth.middleware');
const {
    getDashboard,
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    getTeachers,
    getTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollStudentHandler,
    unenrollStudentHandler,
    getAnnouncements,
    postAnnouncement,
    deleteAnnouncement,
    updateAnnouncement,  // ADD
    completeEnrollment,
    dropEnrollment,
    reactivateEnrollment
} = require('../controllers/admin.controller');


// all routes protected — must be a logged in admin
router.use(verifyToken, authorizeRole('admin'));

// dashboard
router.get('/dashboard', getDashboard);

// student management
router.get('/students', getStudents);
router.post('/students', createStudent);
router.get('/students/:id', getStudent);
router.patch('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

// teacher management
router.get('/teachers', getTeachers);
router.post('/teachers', createTeacher);
router.get('/teachers/:id', getTeacher);
router.patch('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);

// course management
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.get('/courses/:id', getCourse);
router.patch('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// enrollment management
router.post('/enrollments', enrollStudentHandler);
router.delete('/enrollments/:id', unenrollStudentHandler);
router.patch('/enrollments/:id/complete', completeEnrollment);
router.patch('/enrollments/:id/drop', dropEnrollment);
router.patch('/enrollments/:id/reactivate', reactivateEnrollment);

// announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', postAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);  // ADD
router.patch('/announcements/:id', updateAnnouncement);  // ADD


module.exports = router;