const Admin = require('../models/Admin');

class AdminRepository {
    async findById(id) {
        return Admin.findById(id).select('-password');
    }
    async findByEmail(email) {
        return Admin.findOne({ email });
    }
    async findByAdminId(adminId) {
        return Admin.findOne({ adminId });
    }
    async create(data) {
        return Admin.create(data);
    }
    async countAll() {
        return Admin.countDocuments();
    }
}

module.exports = new AdminRepository();