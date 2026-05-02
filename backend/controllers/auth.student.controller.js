const Student = require('../models/Student');
const AuthService = require('../services/auth.service');

class StudentAuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const { token, user } = await AuthService.login(Student, 'student', email, password);
            const { password: _, ...student } = user.toObject();
            res.status(200).json({ message: 'Login successful', token, student });
        } catch (error) {
            if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ message: 'Student not found' });
            if (error.message === 'INVALID_PASSWORD') return res.status(401).json({ message: 'Invalid credentials' });
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

const controller = new StudentAuthController();
module.exports = { loginStudent: controller.login.bind(controller) };