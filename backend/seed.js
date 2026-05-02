const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Admin = require('./models/Admin');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Announcement = require('./models/Announcement');

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // clear everything
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Admin.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    await Announcement.deleteMany({});

    const hashedPassword = await bcrypt.hash('test1234', 10);

    // create admin
    const admin = await Admin.create({
    name: 'Super Admin',
    email: 'admin@arch.com',
    password: hashedPassword,
    adminId: 'ADM-0001',
    role: 'admin'
});

    // create teachers
    const teacher1 = await Teacher.create({
        name: 'Dr. Ahmad Raza',
        email: 'ahmad@arch.com',
        password: hashedPassword,
        employeeId: 'T-001',
        department: 'CS',
        role: 'teacher'
    });

    const teacher2 = await Teacher.create({
        name: 'Dr. Ayesha Khan',
        email: 'ayesha@arch.com',
        password: hashedPassword,
        employeeId: 'T-002',
        department: 'CS',
        role: 'teacher'
    });

    // create student
    const student = await Student.create({
        name: 'Areeb Bucha',
        email: 'areeb@arch.com',
        password: hashedPassword,
        rollNumber: '21L-3211',
        department: 'CS',
        program: 'BSCS',
        semester: '6',
        batch: 'Fall 2021',
        section: 'A',
        phone: '0300-1234567',
        address: 'Lahore, Pakistan',
        guardian: {
            name: 'Mr. Bucha',
            phone: '0300-7654321'
        },
        totalCreditsRequired: 130,
        role: 'student'
    });

    // create courses
    const course1 = await Course.create({
        courseCode: 'CS-3001',
        name: 'Object Oriented Analysis & Design',
        creditHours: 3,
        department: 'CS',
        fee: 45000,
        prerequisites: [],
        weightage: [
            { type: 'quiz', percentage: 10 },
            { type: 'assignment', percentage: 10 },
            { type: 'mid', percentage: 30 },
            { type: 'final', percentage: 50 }
        ],
        sections: [
            {
                sectionName: 'A',
                teacher: teacher1._id,
                totalSeats: 40,
                seatsAvailable: 39,
                schedule: [
                    { day: 'Monday', startTime: '08:00', endTime: '09:30', room: 'CS-Lab 1' },
                    { day: 'Wednesday', startTime: '08:00', endTime: '09:30', room: 'CS-Lab 1' }
                ]
            }
        ]
    });

    const course2 = await Course.create({
        courseCode: 'CS-3012',
        name: 'Database Systems',
        creditHours: 4,
        department: 'CS',
        fee: 45000,
        prerequisites: [],
        weightage: [
            { type: 'quiz', percentage: 10 },
            { type: 'assignment', percentage: 10 },
            { type: 'mid', percentage: 30 },
            { type: 'final', percentage: 50 }
        ],
        sections: [
            {
                sectionName: 'A',
                teacher: teacher2._id,
                totalSeats: 40,
                seatsAvailable: 39,
                schedule: [
                    { day: 'Tuesday', startTime: '09:30', endTime: '11:00', room: 'CS-Lab 2' },
                    { day: 'Thursday', startTime: '09:30', endTime: '11:00', room: 'CS-Lab 2' }
                ]
            }
        ]
    });

    // enroll student in both courses
    const enrollment1 = await Enrollment.create({
        student: student._id,
        course: course1._id,
        sectionId: course1.sections[0]._id,
        semester: 'Spring 2025',
        assessments: [
            { title: 'Quiz 1', type: 'quiz', totalMarks: 10, obtainedMarks: 8 },
            { title: 'Quiz 2', type: 'quiz', totalMarks: 10, obtainedMarks: 9 },
            { title: 'Assignment 1', type: 'assignment', totalMarks: 10, obtainedMarks: 9 },
            { title: 'Mid Term', type: 'mid', totalMarks: 30, obtainedMarks: 25 }
        ],
        attendance: {
            totalLectures: 20,
            attendedLectures: 18,
            tardies: 1,
            classLog: [
                { date: new Date('2025-01-13'), topic: 'Introduction to OOAD', status: 'present' },
                { date: new Date('2025-01-15'), topic: 'UML Diagrams', status: 'present' },
                { date: new Date('2025-01-20'), topic: 'Use Case Diagrams', status: 'absent' },
                { date: new Date('2025-01-22'), topic: 'Class Diagrams', status: 'present' }
            ]
        },
        letterGrade: 'A',
        gradePoints: 4.0,
        isCompleted: false
    });

    const enrollment2 = await Enrollment.create({
        student: student._id,
        course: course2._id,
        sectionId: course2.sections[0]._id,
        semester: 'Spring 2025',
        assessments: [
            { title: 'Quiz 1', type: 'quiz', totalMarks: 10, obtainedMarks: 7 },
            { title: 'Assignment 1', type: 'assignment', totalMarks: 10, obtainedMarks: 8 },
            { title: 'Mid Term', type: 'mid', totalMarks: 30, obtainedMarks: 22 }
        ],
        attendance: {
            totalLectures: 20,
            attendedLectures: 15,
            tardies: 2,
            classLog: [
                { date: new Date('2025-01-14'), topic: 'ER Diagrams', status: 'present' },
                { date: new Date('2025-01-16'), topic: 'Normalization', status: 'absent' },
                { date: new Date('2025-01-21'), topic: 'SQL Basics', status: 'present' },
                { date: new Date('2025-01-23'), topic: 'Joins', status: 'tardy' }
            ]
        },
        letterGrade: 'B+',
        gradePoints: 3.3,
        isCompleted: false
    });

    // create announcements
    await Announcement.create({
        title: 'Mid-Term Examination Schedule Published',
        body: 'Hall assignments for Mid-2 exams are now available on the LMS portal.',
        createdBy: admin._id,
        createdByModel: 'Admin',
        type: 'university',
        weekNumber: 8,
        category: 'mid'
    });

    await Announcement.create({
        title: 'OOAD Assignment 2 Deadline Extended',
        body: 'The deadline for Assignment 2 has been extended to next Friday.',
        createdBy: teacher1._id,
        createdByModel: 'Teacher',
        type: 'faculty',
        course: course1._id,
        weekNumber: 7,
        category: 'notice'
    });

    console.log('✅ Seeded successfully:');
    console.log('   1 admin, 2 teachers, 1 student');
    console.log('   2 courses with sections');
    console.log('   2 enrollments with grades + attendance');
    console.log('   2 announcements');
    console.log('Password for all: test1234');
    process.exit(0);
};

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});