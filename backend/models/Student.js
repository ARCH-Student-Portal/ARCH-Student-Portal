const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    rollNumber: { type: String, required: true, unique: true},
    department: {type: String, required: true },
    program: {type: String, required: true},
    semester: {type: String, required: true},
    role: {type: String, default: 'student'},
    address: { type: String, default: null },
    cnic: { type: String, default: null },
    phone: { type: String, default: null },
    dob: { type: Date, default: null },
    section: { type: String, default: null },
    batch: { type: String, default: null },          // e.g. "Fall 2021"
    guardian: {
        name: { type: String, default: null },
        phone: { type: String, default: null }
    },
    totalCreditsRequired: { type: Number, default: 130 },
    totalSemesters: { type: Number, default: 8 }  
})

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;

