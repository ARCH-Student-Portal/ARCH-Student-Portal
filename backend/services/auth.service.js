const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
    async login(Model, role, email, password) {
        const user = await Model.findOne({ email });
        if (!user) throw new Error('USER_NOT_FOUND');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('INVALID_PASSWORD');

        const token = jwt.sign(
            { id: user._id, role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return { token, user };
    }

    async hashPassword(password) {
        return bcrypt.hash(password, 10);
    }
}

module.exports = new AuthService();