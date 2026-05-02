const Teacher = require('../models/Teacher');
const AuthService = require('../services/auth.service');

class TeacherAuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const { token, user } = await AuthService.login(Teacher, 'teacher', email, password);
            const { password: _, ...teacher } = user.toObject();
            res.status(200).json({ message: 'Login successful', token, teacher });
        } catch (error) {
            if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ message: 'Teacher not found' });
            if (error.message === 'INVALID_PASSWORD') return res.status(401).json({ message: 'Invalid credentials' });
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

const controller = new TeacherAuthController();
module.exports = { loginTeacher: controller.login.bind(controller) };