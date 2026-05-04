const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    role: { type: String, default: 'teacher' },
    designation: { type: String, default: '' },
    specialization: { type: String, default: '' },
    experience: { type: Number, default: 0 }
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;