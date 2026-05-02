const { AdminAuthTemplate } = require('../patterns/AuthTemplate');

class AdminAuthController {
    constructor() {
        this.authTemplate = new AdminAuthTemplate();
    }

    async login(req, res) {
        try {
            const { identifier, password } = req.body;
            const { token, user } = await this.authTemplate.login(identifier, password);
            res.status(200).json({ message: 'Login successful', token, admin: user });
        } catch (error) {
            if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ message: 'Admin not found' });
            if (error.message === 'INVALID_PASSWORD') return res.status(401).json({ message: 'Invalid credentials' });
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

const controller = new AdminAuthController();
module.exports = { loginAdmin: controller.login.bind(controller) };