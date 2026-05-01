const express = require('express');
const router = express.Router();
const { loginTeacher } = require('../controllers/auth.teacher.controller');

router.post('/login', loginTeacher);

module.exports = router;