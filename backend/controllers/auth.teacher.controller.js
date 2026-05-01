const Teacher = require('../models/Teacher');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginTeacher = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if teacher exists
        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // 2. Compare password with hashed password in DB
        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 3. Sign a JWT token
        const token = jwt.sign(
            { id: teacher._id, role: 'teacher' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // 4. Send token + basic info back
        res.status(200).json({
            message: 'Login successful',
            token,
            teacher: {
                id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                role: teacher.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { loginTeacher };