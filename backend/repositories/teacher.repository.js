const Teacher = require('../models/Teacher');

class TeacherRepository {
    async findById(id) {
        return Teacher.findById(id).select('-password');
    }
    async findAll() {
        return Teacher.find().select('-password');
    }
    async findByEmail(email) {
        return Teacher.findOne({ email });
    }
    async findByEmailOrEmployeeId(email, employeeId) {
        return Teacher.findOne({ $or: [{ email }, { employeeId }] });
    }
    async create(data) {
        return Teacher.create(data);
    }
    async updateById(id, updates) {
        return Teacher.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).select('-password');
    }
    async deleteById(id) {
        return Teacher.findByIdAndDelete(id);
    }
    async countAll() {
        return Teacher.countDocuments();
    }
}

module.exports = new TeacherRepository();