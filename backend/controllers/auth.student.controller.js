const Student = require('../models/Student');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const loginStudent = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if student exists
        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // 2. Compare password with hashed password in DB
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 3. Sign a JWT token
        const token = jwt.sign(
            { id: student._id, role: 'student' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // 4. Send token + basic info back
        res.status(200).json({
            message: 'Login successful',
            token,
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                role: student.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { loginStudent };