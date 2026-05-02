const Admin = require('../models/Admin');
const { login } = require('../services/auth.service');

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { token, user } = await login(Admin, 'admin', email, password);
        const { password: _, ...admin } = user.toObject();
        res.status(200).json({ message: 'Login successful', token, admin });
    } catch (error) {
        if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ message: 'Admin not found' });
        if (error.message === 'INVALID_PASSWORD') return res.status(401).json({ message: 'Invalid credentials' });
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { loginAdmin };