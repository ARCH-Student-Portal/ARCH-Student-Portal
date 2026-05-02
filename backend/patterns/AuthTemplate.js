const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthTemplate {
    // template method — defines the skeleton of the algorithm
    async login(email, password) {
        const user = await this.findUser(email);
        if (!user) throw new Error('USER_NOT_FOUND');

        const isMatch = await this.validatePassword(password, user.password);
        if (!isMatch) throw new Error('INVALID_PASSWORD');

        const token = this.generateToken(user);
        const sanitized = this.sanitizeUser(user);

        return { token, user: sanitized };
    }

    // step 1 — subclasses must implement this
    async findUser(email) {
        throw new Error('findUser() must be implemented');
    }

    // step 2 — shared implementation, can be overridden
    async validatePassword(plain, hashed) {
        return bcrypt.compare(plain, hashed);
    }

    // step 3 — shared implementation, can be overridden
    generateToken(user) {
        return jwt.sign(
            { id: user._id, role: this.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
    }

    // step 4 — subclasses must implement this
    sanitizeUser(user) {
        throw new Error('sanitizeUser() must be implemented');
    }
}

class StudentAuthTemplate extends AuthTemplate {
    constructor() {
        super();
        this.role = 'student';
    }

    async findUser(email) {
        const Student = require('../models/Student');
        return Student.findOne({ email });
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

    async findUser(email) {
        const Teacher = require('../models/Teacher');
        return Teacher.findOne({ email });
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

    async findUser(email) {
        const Admin = require('../models/Admin');
        return Admin.findOne({ email });
    }

    sanitizeUser(user) {
        const { password, ...admin } = user.toObject();
        return admin;
    }
}

module.exports = { StudentAuthTemplate, TeacherAuthTemplate, AdminAuthTemplate };