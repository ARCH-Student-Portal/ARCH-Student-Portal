const Student = require('../models/Student');

class StudentRepository {
    async findById(id) {
        return Student.findById(id).select('-password');
    }
    async findAll() {
        return Student.find().select('-password');
    }
    async findByEmail(email) {
        return Student.findOne({ email });
    }
    async findByEmailOrRoll(email, rollNumber) {
        return Student.findOne({ $or: [{ email }, { rollNumber }] });
    }
    async create(data) {
        return Student.create(data);
    }
    async updateById(id, updates) {
        return Student.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).select('-password');
    }
    async deleteById(id) {
        return Student.findByIdAndDelete(id);
    }
    async countAll() {
        return Student.countDocuments();
    }
    async findAllSelect(fields) {
        return Student.find().select(fields);
    }
    async findRecentLimit(limit) {
        return Student.find().sort({ _id: -1 }).limit(limit).select('name rollNumber program semester');
    }
}

module.exports = new StudentRepository();