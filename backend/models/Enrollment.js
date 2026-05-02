const mongoose = require('mongoose');

// iindividual assesments like quiz mid
const assessmentSchema = new mongoose.Schema({
    title: {type: String, required: true},
    type: {type: String, required: true},
    totalMarks: {type: Number, required: true},
    obtainedMarks: {type: Number, default: 0}
});

// attendance per course
const attendanceSchema = new mongoose.Schema({
    totalLectures: {type: Number, default: 0},
    attendedLectures: {type: Number, default: 0},
    tardies: {type: Number, default: 0},
    classLog: [{
        date: { type: Date, required: true },
        topic: { type: String, default: null },      // e.g. "Introduction to AI"
        status: { type: String, enum: ['present', 'absent', 'tardy'], required: true }
    }]
});

// main schema

const enrollmentSchema = new mongoose.Schema({
    student: {type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true},
    course: {type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    sectionId: {type: mongoose.Schema.Types.ObjectId, required: true},
    semester: {type: String ,required: true}, //"Fall 2024"
    assessments: [assessmentSchema],
    attendance: {type: attendanceSchema, default: () => ({})  },
    letterGrade: {type: String, default: null}, // "A", "B"
    gradePoints: {type: Number, default: null}, // 3.6, 2.9
    isCompleted: {type: Boolean, default: false},
    isDropped: {type: Boolean, default: false}

});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
