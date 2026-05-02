const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthTemplate {
    async login(identifier, password) {
        const user = await this.findUser(identifier);
        if (!user) throw new Error('USER_NOT_FOUND');

        const isMatch = await this.validatePassword(password, user.password);
        if (!isMatch) throw new Error('INVALID_PASSWORD');

        const token = this.generateToken(user);
        const sanitized = this.sanitizeUser(user);

        return { token, user: sanitized };
    }

    async findUser(identifier) {
        throw new Error('findUser() must be implemented');
    }

    async validatePassword(plain, hashed) {
        return bcrypt.compare(plain, hashed);
    }

    generateToken(user) {
        return jwt.sign(
            { id: user._id, role: this.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
    }

    sanitizeUser(user) {
        throw new Error('sanitizeUser() must be implemented');
    }
}

class StudentAuthTemplate extends AuthTemplate {
    constructor() {
        super();
        this.role = 'student';
    }

    async findUser(identifier) {
        const Student = require('../models/Student');
        return Student.findOne({ rollNumber: identifier });
    }

    sanitizeUser(user) {
        const { password, ...student } = user.toObject();
        return student;
    }
}

class TeacherAuthTemplate extends AuthTemplate {
    constructor() {
        super();
        this.role = 'teacher';
    }

    async findUser(identifier) {
        const Teacher = require('../models/Teacher');
        return Teacher.findOne({ employeeId: identifier });
    }

    sanitizeUser(user) {
        const { password, ...teacher } = user.toObject();
        return teacher;
    }
}

class AdminAuthTemplate extends AuthTemplate {
    constructor() {
        super();
        this.role = 'admin';
    }

    async findUser(identifier) {
        const Admin = require('../models/Admin');
        return Admin.findOne({ adminId: identifier });
    }

    sanitizeUser(user) {
        const { password, ...admin } = user.toObject();
        return admin;
    }
}

module.exports = { StudentAuthTemplate, TeacherAuthTemplate, AdminAuthTemplate };