const express = require('express');
const router  = express.Router();
const { loginStudent, signupStudent } = require('../controllers/auth.student.controller');

router.post('/login',  loginStudent);
router.post('/signup', signupStudent);

module.exports = router;