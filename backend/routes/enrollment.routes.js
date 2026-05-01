const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth.middleware');
const {
    enrollStudent,
    getAllEnrollments,
    updateAssessments,
    updateAttendance,
    updateGrade,
    markCompleted
} = require('../controllers/enrollment.controller');

router.use(verifyToken);

// POST /api/enrollments  (student only)
router.post('/', authorizeRole('student'), enrollStudent);

// GET /api/enrollments  (admin only)
router.get('/', authorizeRole('admin'), getAllEnrollments);

// PUT /api/enrollments/:id/assessments  (teacher only)
router.put('/:id/assessments', authorizeRole('teacher'), updateAssessments);

// PUT /api/enrollments/:id/attendance  (teacher only)
router.put('/:id/attendance', authorizeRole('teacher'), updateAttendance);

// PUT /api/enrollments/:id/grade  (teacher only)
router.put('/:id/grade', authorizeRole('teacher'), updateGrade);

// PUT /api/enrollments/:id/complete  (admin only)
router.put('/:id/complete', authorizeRole('admin'), markCompleted);

module.exports = router;
