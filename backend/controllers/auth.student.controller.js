const { StudentAuthTemplate } = require('../patterns/AuthTemplate');

class StudentAuthController {
    constructor() {
        this.authTemplate = new StudentAuthTemplate();
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const { token, user } = await this.authTemplate.login(email, password);
            res.status(200).json({ message: 'Login successful', token, student: user });
        } catch (error) {
            if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ message: 'Student not found' });
            if (error.message === 'INVALID_PASSWORD') return res.status(401).json({ message: 'Invalid credentials' });
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

const controller = new StudentAuthController();
module.exports = { loginStudent: controller.login.bind(controller) };