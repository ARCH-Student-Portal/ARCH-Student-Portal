const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    rollNumber: { type: String, required: true, unique: true},
    department: {type: String, required: true },
    program: {type: String, required: true},
    semester: {type: String, required: true},
    role: {type: String, default: 'student'}    
})

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;

