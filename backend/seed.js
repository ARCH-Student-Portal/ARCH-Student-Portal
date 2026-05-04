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

    // ── ADMIN ──────────────────────────────────────────────────────────────
    const admin = await Admin.create({
        name: 'Super Admin',
        email: 'admin@arch.com',
        password: hashedPassword,
        adminId: 'ADM-0001',
        role: 'admin'
    });

    // ── TEACHERS ───────────────────────────────────────────────────────────
    const teacher1 = await Teacher.create({
    name: 'Dr. Ahmad Raza',
    email: 'ahmad@arch.com',
    password: hashedPassword,
    employeeId: 'T-001',
    department: 'CS',
    designation: 'Associate Professor',
    specialization: 'Software Engineering & Design Patterns',
    experience: 8,
    role: 'teacher'
});

const teacher2 = await Teacher.create({
    name: 'Dr. Ayesha Khan',
    email: 'ayesha@arch.com',
    password: hashedPassword,
    employeeId: 'T-002',
    department: 'CS',
    designation: 'Assistant Professor',
    specialization: 'Database Systems & Data Engineering',
    experience: 5,
    role: 'teacher'
});

const teacher3 = await Teacher.create({
    name: 'Dr. Bilal Hassan',
    email: 'bilal@arch.com',
    password: hashedPassword,
    employeeId: 'T-003',
    department: 'CS',
    designation: 'Lecturer',
    specialization: 'Algorithms & Competitive Programming',
    experience: 3,
    role: 'teacher'
});

const teacher4 = await Teacher.create({
    name: 'Dr. Sara Malik',
    email: 'sara@arch.com',
    password: hashedPassword,
    employeeId: 'T-004',
    department: 'CS',
    designation: 'Associate Professor',
    specialization: 'Software Engineering & Mathematics',
    experience: 6,
    role: 'teacher'
});
    // ── STUDENTS ───────────────────────────────────────────────────────────
    const student1 = await Student.create({
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
        guardian: { name: 'Mr. Bucha', phone: '0300-7654321' },
        totalCreditsRequired: 130,
        role: 'student'
    });

    const student2 = await Student.create({
        name: 'Hamza Iqbal',
        email: 'hamza@arch.com',
        password: hashedPassword,
        rollNumber: '21L-3212',
        department: 'CS',
        program: 'BSCS',
        semester: '6',
        batch: 'Fall 2021',
        section: 'A',
        phone: '0301-2345678',
        address: 'Lahore, Pakistan',
        guardian: { name: 'Mr. Iqbal', phone: '0301-8765432' },
        totalCreditsRequired: 130,
        role: 'student'
    });

    const student3 = await Student.create({
        name: 'Fatima Zahra',
        email: 'fatima@arch.com',
        password: hashedPassword,
        rollNumber: '22L-1001',
        department: 'CS',
        program: 'BSCS',
        semester: '4',
        batch: 'Fall 2022',
        section: 'B',
        phone: '0302-3456789',
        address: 'Islamabad, Pakistan',
        guardian: { name: 'Mr. Zahra', phone: '0302-9876543' },
        totalCreditsRequired: 130,
        role: 'student'
    });

    const student4 = await Student.create({
        name: 'Ali Hassan',
        email: 'ali@arch.com',
        password: hashedPassword,
        rollNumber: '22L-1002',
        department: 'CS',
        program: 'BSCS',
        semester: '4',
        batch: 'Fall 2022',
        section: 'B',
        phone: '0303-4567890',
        address: 'Karachi, Pakistan',
        guardian: { name: 'Mr. Hassan', phone: '0303-0987654' },
        totalCreditsRequired: 130,
        role: 'student'
    });

    const student5 = await Student.create({
        name: 'Zainab Noor',
        email: 'zainab@arch.com',
        password: hashedPassword,
        rollNumber: '23L-0501',
        department: 'CS',
        program: 'BSCS',
        semester: '2',
        batch: 'Fall 2023',
        section: 'A',
        phone: '0304-5678901',
        address: 'Rawalpindi, Pakistan',
        guardian: { name: 'Mr. Noor', phone: '0304-1098765' },
        totalCreditsRequired: 130,
        role: 'student'
    });

    const student6 = await Student.create({
        name: 'Omar Farooq',
        email: 'omar@arch.com',
        password: hashedPassword,
        rollNumber: '20L-5001',
        department: 'CS',
        program: 'BSCS',
        semester: '8',
        batch: 'Fall 2020',
        section: 'A',
        phone: '0305-6789012',
        address: 'Lahore, Pakistan',
        guardian: { name: 'Mr. Farooq', phone: '0305-2109876' },
        totalCreditsRequired: 130,
        role: 'student'
    });

    // ── COURSES ────────────────────────────────────────────────────────────
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
                seatsAvailable: 36,
                schedule: [
                    { day: 'Monday', startTime: '08:00', endTime: '09:30', room: 'CS-Lab 1' },
                    { day: 'Wednesday', startTime: '08:00', endTime: '09:30', room: 'CS-Lab 1' }
                ]
            },
            {
                sectionName: 'B',
                teacher: teacher2._id,
                totalSeats: 40,
                seatsAvailable: 38,
                schedule: [
                    { day: 'Tuesday', startTime: '11:00', endTime: '12:30', room: 'CS-Lab 2' },
                    { day: 'Thursday', startTime: '11:00', endTime: '12:30', room: 'CS-Lab 2' }
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
                seatsAvailable: 37,
                schedule: [
                    { day: 'Tuesday', startTime: '09:30', endTime: '11:00', room: 'CS-Lab 2' },
                    { day: 'Thursday', startTime: '09:30', endTime: '11:00', room: 'CS-Lab 2' }
                ]
            }
        ]
    });

    const course3 = await Course.create({
        courseCode: 'CS-2010',
        name: 'Data Structures & Algorithms',
        creditHours: 3,
        department: 'CS',
        fee: 42000,
        prerequisites: [],
        weightage: [
            { type: 'quiz', percentage: 15 },
            { type: 'assignment', percentage: 10 },
            { type: 'mid', percentage: 25 },
            { type: 'final', percentage: 50 }
        ],
        sections: [
            {
                sectionName: 'A',
                teacher: teacher3._id,
                totalSeats: 45,
                seatsAvailable: 40,
                schedule: [
                    { day: 'Monday', startTime: '11:00', endTime: '12:30', room: 'CR-101' },
                    { day: 'Wednesday', startTime: '11:00', endTime: '12:30', room: 'CR-101' }
                ]
            },
            {
                sectionName: 'B',
                teacher: teacher3._id,
                totalSeats: 45,
                seatsAvailable: 42,
                schedule: [
                    { day: 'Tuesday', startTime: '08:00', endTime: '09:30', room: 'CR-102' },
                    { day: 'Thursday', startTime: '08:00', endTime: '09:30', room: 'CR-102' }
                ]
            }
        ]
    });

    const course4 = await Course.create({
        courseCode: 'CS-3005',
        name: 'Software Engineering',
        creditHours: 3,
        department: 'CS',
        fee: 42000,
        prerequisites: [],
        weightage: [
            { type: 'quiz', percentage: 10 },
            { type: 'assignment', percentage: 15 },
            { type: 'mid', percentage: 25 },
            { type: 'final', percentage: 50 }
        ],
        sections: [
            {
                sectionName: 'A',
                teacher: teacher4._id,
                totalSeats: 40,
                seatsAvailable: 35,
                schedule: [
                    { day: 'Wednesday', startTime: '14:00', endTime: '15:30', room: 'CR-201' },
                    { day: 'Friday', startTime: '14:00', endTime: '15:30', room: 'CR-201' }
                ]
            }
        ]
    });

    const course5 = await Course.create({
        courseCode: 'CS-4001',
        name: 'Artificial Intelligence',
        creditHours: 3,
        department: 'CS',
        fee: 48000,
        prerequisites: [course3._id],
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
                totalSeats: 35,
                seatsAvailable: 30,
                schedule: [
                    { day: 'Monday', startTime: '14:00', endTime: '15:30', room: 'CS-Lab 3' },
                    { day: 'Thursday', startTime: '14:00', endTime: '15:30', room: 'CS-Lab 3' }
                ]
            }
        ]
    });

    const course6 = await Course.create({
        courseCode: 'MT-1001',
        name: 'Calculus & Analytical Geometry',
        creditHours: 3,
        department: 'CS',
        fee: 38000,
        prerequisites: [],
        weightage: [
            { type: 'quiz', percentage: 15 },
            { type: 'assignment', percentage: 10 },
            { type: 'mid', percentage: 25 },
            { type: 'final', percentage: 50 }
        ],
        sections: [
            {
                sectionName: 'A',
                teacher: teacher4._id,
                totalSeats: 50,
                seatsAvailable: 45,
                schedule: [
                    { day: 'Monday', startTime: '09:30', endTime: '11:00', room: 'CR-301' },
                    { day: 'Wednesday', startTime: '09:30', endTime: '11:00', room: 'CR-301' }
                ]
            }
        ]
    });

    const course7 = await Course.create({
        courseCode: 'CS-1001',
        name: 'Programming Fundamentals',
        creditHours: 3,
        department: 'CS',
        fee: 38000,
        prerequisites: [],
        weightage: [
            { type: 'quiz', percentage: 10 },
            { type: 'assignment', percentage: 15 },
            { type: 'mid', percentage: 25 },
            { type: 'final', percentage: 50 }
        ],
        sections: [
            {
                sectionName: 'A',
                teacher: teacher3._id,
                totalSeats: 50,
                seatsAvailable: 48,
                schedule: [
                    { day: 'Tuesday', startTime: '14:00', endTime: '15:30', room: 'CS-Lab 4' },
                    { day: 'Thursday', startTime: '14:00', endTime: '15:30', room: 'CS-Lab 4' }
                ]
            }
        ]
    });

    // ── ENROLLMENTS — STUDENT 1 (Areeb, Sem 6) ────────────────────────────
    const enroll1_1 = await Enrollment.create({
        student: student1._id,
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
            totalLectures: 20, attendedLectures: 18, tardies: 1,
            classLog: [
                { date: new Date('2025-01-13'), topic: 'Introduction to OOAD', status: 'present' },
                { date: new Date('2025-01-15'), topic: 'UML Diagrams', status: 'present' },
                { date: new Date('2025-01-20'), topic: 'Use Case Diagrams', status: 'absent' },
                { date: new Date('2025-01-22'), topic: 'Class Diagrams', status: 'present' },
                { date: new Date('2025-01-27'), topic: 'Sequence Diagrams', status: 'present' },
            ]
        },
        letterGrade: 'A', gradePoints: 4.0, isCompleted: false
    });

    const enroll1_2 = await Enrollment.create({
        student: student1._id,
        course: course2._id,
        sectionId: course2.sections[0]._id,
        semester: 'Spring 2025',
        assessments: [
            { title: 'Quiz 1', type: 'quiz', totalMarks: 10, obtainedMarks: 7 },
            { title: 'Assignment 1', type: 'assignment', totalMarks: 10, obtainedMarks: 8 },
            { title: 'Mid Term', type: 'mid', totalMarks: 30, obtainedMarks: 22 }
        ],
        attendance: {
            totalLectures: 20, attendedLectures: 15, tardies: 2,
            classLog: [
                { date: new Date('2025-01-14'), topic: 'ER Diagrams', status: 'present' },
                { date: new Date('2025-01-16'), topic: 'Normalization', status: 'absent' },
                { date: new Date('2025-01-21'), topic: 'SQL Basics', status: 'present' },
                { date: new Date('2025-01-23'), topic: 'Joins', status: 'tardy' },
            ]
        },
        letterGrade: 'B+', gradePoints: 3.3, isCompleted: false
    });

    // past semester enrollments for student1
    const enroll1_past1 = await Enrollment.create({
        student: student1._id,
        course: course3._id,
        sectionId: course3.sections[0]._id,
        semester: 'Fall 2024',
        assessments: [
            { title: 'Quiz 1', type: 'quiz', totalMarks: 10, obtainedMarks: 9 },
            { title: 'Mid Term', type: 'mid', totalMarks: 30, obtainedMarks: 27 },
            { title: 'Final', type: 'final', totalMarks: 50, obtainedMarks: 44 }
        ],
        attendance: { totalLectures: 28, attendedLectures: 26, tardies: 0, classLog: [] },
        letterGrade: 'A', gradePoints: 4.0, isCompleted: true
    });

    const enroll1_past2 = await Enrollment.create({
        student: student1._id,
        course: course6._id,
        sectionId: course6.sections[0]._id,
        semester: 'Fall 2024',
        assessments: [
            { title: 'Quiz 1', type: 'quiz', totalMarks: 10, obtainedMarks: 7 },
            { title: 'Mid Term', type: 'mid', totalMarks: 30, obtainedMarks: 21 },
            { title: 'Final', type: 'final', totalMarks: 50, obtainedMarks: 38 }
        ],
        attendance: { totalLectures: 28, attendedLectures: 22, tardies: 1, classLog: [] },
        letterGrade: 'B', gradePoints: 3.0, isCompleted: true
    });

    // ── ENROLLMENTS — STUDENT 2 (Hamza) ───────────────────────────────────
    const enroll2_1 = await Enrollment.create({
        student: student2._id,
        course: course1._id,
        sectionId: course1.sections[0]._id,
        semester: 'Spring 2025',
        assessments: [
            { title: 'Quiz 1', type: 'quiz', totalMarks: 10, obtainedMarks: 6 },
            { title: 'Assignment 1', type: 'assignment', totalMarks: 10, obtainedMarks: 7 },
            { title: 'Mid Term', type: 'mid', totalMarks: 30, obtainedMarks: 18 }
        ],
        attendance: {
            totalLectures: 20, attendedLectures: 14, tardies: 2,
            classLog: [
                { date: new Date('2025-01-13'), topic: 'Introduction to OOAD', status: 'present' },
                { date: new Date('2025-01-15'), topic: 'UML Diagrams', status: 'absent' },
                { date: new Date('2025-01-20'), topic: 'Use Case Diagrams', status: 'present' },
                { date: new Date('2025-01-22'), topic: 'Class Diagrams', status: 'absent' },
            ]
        },
        letterGrade: 'C+', gradePoints: 2.3, isCompleted: false
    });

    const enroll2_2 = await Enrollment.create({
        student: student2._id,
        course: course4._id,
        sectionId: course4.sections[0]._id,
        semester: 'Spring 2025',
        assessments: [
            { title: 'Quiz 1', type: 'quiz', totalMarks: 10, obtainedMarks: 8 },
            { title: 'Assignment 1', type: 'assignment', totalMarks: 10, obtainedMarks: 9 },
            { title: 'Mid Term', type: 'mid', totalMarks: 30, obtainedMarks: 24 }
        ],
        attendance: {
            totalLectures: 18, attendedLectures: 17, tardies: 0,
            classLog: [
                { date: new Date('2025-01-15'), topic: 'SDLC Models', status: 'present' },
                { date: new Date('2025-01-22'), topic: 'Agile Basics', status: 'present' },
            ]
        },
        letterGrade: 'A-', gradePoints: 3.7, isCompleted: false
    });

    // ── ENROLLMENTS — STUDENT 3 (Fatima, Sem 4) ───────────────────────────
    const enroll3_1 = await Enrollment.create({
        student: student3._id,
        course: course3._id,
        sectionId: course3.sections[1]._id,
        semester: 'Spring 2025',
        assessments: [
            { title: 'Quiz 1', type: 'quiz', totalMarks: 10, obtainedMarks: 9 },
            { title: 'Assignment 1', type: 'assignment', totalMarks: 10, obtainedMarks: 8 },
            { title: 'Mid Term', type: 'mid', totalMarks: 30, obtainedMarks: 26 }
        ],
        attendance: {
            totalLectures: 22, attendedLectures: 21, tardies: 0,
            classLog: [
                { date: new Date('2025-01-14'), topic: 'Arrays & Linked Lists', status: 'present' },
                { date: new Date('2025-01-21'), topic: 'Stacks & Queues', status: 'present' },
                { date: new Date('2025-01-28'), topic: 'Trees', status: 'present' },
            ]
        },
        letterGrade: 'A', gradePoints: 4.0, isCompleted: false
    });

    const enroll3_2 = await Enrollment.create({
        student: student3._id,
        course: course2._id,
        sectionId: course2.sections[0]._id,
        semester: 'Spring 2025',
        assessments: [
            { title: 'Quiz 1', type: 'quiz', totalMarks: 10, obtainedMarks: 8 },
            { title: 'Mid Term', type: 'mid', totalMarks: 30, obtainedMarks: 23 }
        ],
        attendance: {
            totalLectures: 20, attendedLectures: 16, tardies: 1,
            classLog: [
                { date: new Date('2025-01-14'), topic: 'ER Diagrams', status: 'present' },
                { date: new Date('2025-01-21'), topic: 'Normalization', status: 'absent' },
            ]
        },
        letterGrade: 'B+', gradePoints: 3.3, isCompleted: false
    });

    // ── ENROLLMENTS — STUDENT 4 (Ali, Sem 4) ──────────────────────────────
    const enroll4_1 = await Enrollment.create({
        student: student4._id,
        course: course3._id,
        sectionId: course3.sections[1]._id,
        semester: 'Spring 2025',
        assessments: [
            { title: 'Quiz 1', type: 'quiz', totalMarks: 10, obtainedMarks: 5 },
            { title: 'Mid Term', type: 'mid', totalMarks: 30, obtainedMarks: 15 }
        ],
        attendance: {
            totalLectures: 22, attendedLectures: 15, tardies: 3,
            classLog: [
                { date: new Date('2025-01-14'), topic: 'Arrays & Linked Lists', status: 'absent' },
                { date: new Date('2025-01-21'), topic: 'Stacks & Queues', status: 'present' },
                { date: new Date('2025-01-28'), topic: 'Trees', status: 'tardy' },
            ]
        },
        letterGrade: 'C', gradePoints: 2.0, isCompleted: false
    });

    // ── ENROLLMENTS — STUDENT 5 (Zainab, Sem 2) ───────────────────────────
    const enroll5_1 = await Enrollment.create({
        student: student5._id,
        course: course7._id,
        sectionId: course7.sections[0]._id,
        semester: 'Spring 2025',
        assessments: [
            { title: 'Quiz 1', type: 'quiz', totalMarks: 10, obtainedMarks: 9 },
            { title: 'Assignment 1', type: 'assignment', totalMarks: 10, obtainedMarks: 10 },
            { title: 'Mid Term', type: 'mid', totalMarks: 30, obtainedMarks: 28 }
        ],
        attendance: {
            totalLectures: 18, attendedLectures: 18, tardies: 0,
            classLog: [
                { date: new Date('2025-01-14'), topic: 'Intro to Programming', status: 'present' },
                { date: new Date('2025-01-21'), topic: 'Variables & Types', status: 'present' },
                { date: new Date('2025-01-28'), topic: 'Control Flow', status: 'present' },
            ]
        },
        letterGrade: 'A+', gradePoints: 4.0, isCompleted: false
    });

    const enroll5_2 = await Enrollment.create({
        student: student5._id,
        course: course6._id,
        sectionId: course6.sections[0]._id,
        semester: 'Spring 2025',
        assessments: [
            { title: 'Quiz 1', type: 'quiz', totalMarks: 10, obtainedMarks: 8 },
            { title: 'Mid Term', type: 'mid', totalMarks: 30, obtainedMarks: 24 }
        ],
        attendance: {
            totalLectures: 18, attendedLectures: 17, tardies: 0,
            classLog: [
                { date: new Date('2025-01-13'), topic: 'Limits', status: 'present' },
                { date: new Date('2025-01-20'), topic: 'Derivatives', status: 'present' },
            ]
        },
        letterGrade: 'A', gradePoints: 4.0, isCompleted: false
    });

    // ── ENROLLMENTS — STUDENT 6 (Omar, Sem 8) ─────────────────────────────
    const enroll6_1 = await Enrollment.create({
        student: student6._id,
        course: course5._id,
        sectionId: course5.sections[0]._id,
        semester: 'Spring 2025',
        assessments: [
            { title: 'Quiz 1', type: 'quiz', totalMarks: 10, obtainedMarks: 8 },
            { title: 'Assignment 1', type: 'assignment', totalMarks: 10, obtainedMarks: 7 },
            { title: 'Mid Term', type: 'mid', totalMarks: 30, obtainedMarks: 24 }
        ],
        attendance: {
            totalLectures: 20, attendedLectures: 19, tardies: 0,
            classLog: [
                { date: new Date('2025-01-13'), topic: 'Search Algorithms', status: 'present' },
                { date: new Date('2025-01-20'), topic: 'CSP', status: 'present' },
                { date: new Date('2025-01-27'), topic: 'Bayesian Networks', status: 'present' },
            ]
        },
        letterGrade: 'A-', gradePoints: 3.7, isCompleted: false
    });

    // past completed for Omar
    const enroll6_past = await Enrollment.create({
        student: student6._id,
        course: course3._id,
        sectionId: course3.sections[0]._id,
        semester: 'Fall 2024',
        assessments: [
            { title: 'Mid Term', type: 'mid', totalMarks: 30, obtainedMarks: 25 },
            { title: 'Final', type: 'final', totalMarks: 50, obtainedMarks: 42 }
        ],
        attendance: { totalLectures: 28, attendedLectures: 25, tardies: 1, classLog: [] },
        letterGrade: 'A-', gradePoints: 3.7, isCompleted: true
    });

    // ── ANNOUNCEMENTS ──────────────────────────────────────────────────────
    await Announcement.create({
        title: 'Mid-Term Examination Schedule Published',
        body: 'Hall assignments for Mid-2 exams are now available on the LMS portal. Students must carry their ID cards.',
        createdBy: admin._id,
        createdByModel: 'Admin',
        type: 'university',
        weekNumber: 8,
        category: 'mid'
    });

    await Announcement.create({
        title: 'Campus Closure — Eid-ul-Fitr Holiday',
        body: 'Campus will remain closed from March 29 to April 2. All classes are suspended during this period.',
        createdBy: admin._id,
        createdByModel: 'Admin',
        type: 'university',
        weekNumber: 10,
        category: 'notice'
    });

    await Announcement.create({
        title: 'OOAD Assignment 2 Deadline Extended',
        body: 'Due to the recent server outage, the deadline for Assignment 2 has been extended to next Friday midnight.',
        createdBy: teacher1._id,
        createdByModel: 'Teacher',
        type: 'faculty',
        course: course1._id,
        weekNumber: 7,
        category: 'notice'
    });

    await Announcement.create({
        title: 'DB Systems Quiz 3 Syllabus',
        body: 'Quiz 3 will cover Transactions, Concurrency Control, and Recovery. Refer to chapters 15-17.',
        createdBy: teacher2._id,
        createdByModel: 'Teacher',
        type: 'faculty',
        course: course2._id,
        weekNumber: 9,
        category: 'notice'
    });

    await Announcement.create({
        title: 'Final Exam Date Announced',
        body: 'Final examinations will commence from May 15. Detailed schedule will be posted on the student portal.',
        createdBy: admin._id,
        createdByModel: 'Admin',
        type: 'university',
        weekNumber: 16,
        category: 'final'
    });

    await Announcement.create({
        title: 'DSA Lab Session Rescheduled',
        body: 'This week lab session has been moved to Friday 2PM in CS-Lab 3 due to room maintenance.',
        createdBy: teacher3._id,
        createdByModel: 'Teacher',
        type: 'faculty',
        course: course3._id,
        weekNumber: 6,
        category: 'activity'
    });

    console.log('✅ Seeded successfully:');
    console.log('   1 admin, 4 teachers, 6 students');
    console.log('   7 courses with multiple sections');
    console.log('   12 enrollments with grades + attendance');
    console.log('   6 announcements');
    console.log('');
    console.log('Student logins:');
    console.log('   21L-3211 / test1234  (Areeb  — Sem 6)');
    console.log('   21L-3212 / test1234  (Hamza  — Sem 6)');
    console.log('   22L-1001 / test1234  (Fatima — Sem 4)');
    console.log('   22L-1002 / test1234  (Ali    — Sem 4)');
    console.log('   23L-0501 / test1234  (Zainab — Sem 2)');
    console.log('   20L-5001 / test1234  (Omar   — Sem 8)');
    console.log('Teacher logins:');
    console.log('   T-001 / test1234  (Dr. Ahmad)');
    console.log('   T-002 / test1234  (Dr. Ayesha)');
    console.log('   T-003 / test1234  (Dr. Bilal)');
    console.log('   T-004 / test1234  (Dr. Sara)');
    console.log('Admin login:');
    console.log('   ADM-0001 / test1234');
    process.exit(0);
};

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});