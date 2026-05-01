const express = require('express');
const router = express.Router();
const { loginStudent } = require('../controllers/auth.student.controller');

router.post('/login', loginStudent);

module.exports = router;