const express = require('express');
const router = express.Router();
const { loginStudent } = require('../controllers/auth.student.controller');
const { loginTeacher } = require('../controllers/auth.teacher.controller');
const { loginAdmin } = require('../controllers/auth.admin.controller');

// POST /api/auth/student/login
router.post('/student/login', loginStudent);

// POST /api/auth/teacher/login
router.post('/teacher/login', loginTeacher);

// POST /api/auth/admin/login
router.post('/admin/login', loginAdmin);

module.exports = router;
