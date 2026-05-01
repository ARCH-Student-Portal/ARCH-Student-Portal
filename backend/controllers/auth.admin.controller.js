const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if admin exists
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // 2. Compare password with hashed password in DB
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 3. Sign a JWT token
        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // 4. Send token + basic info back
        res.status(200).json({
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { loginAdmin };