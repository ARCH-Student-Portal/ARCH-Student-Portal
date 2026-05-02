const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Announcement = require('../models/Announcement');
const bcrypt = require('bcryptjs');
const { enrollStudent, unenrollStudent } = require('../services/enrollment.service');

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalTeachers = await Teacher.countDocuments();
        const activeCourses = await Course.countDocuments();

        const students = await Student.find().select('department');
        const departmentMap = {};
        students.forEach(s => {
            if (!departmentMap[s.department]) departmentMap[s.department] = 0;
            departmentMap[s.department]++;
        });
        const enrollmentByDepartment = Object.entries(departmentMap).map(
            ([department, count]) => ({ department, count })
        );

        const enrollments = await Enrollment.find({ isCompleted: false });
        let totalPercentage = 0;
        let countWithLectures = 0;
        enrollments.forEach(e => {
            if (e.attendance.totalLectures > 0) {
                totalPercentage += (e.attendance.attendedLectures / e.attendance.totalLectures) * 100;
                countWithLectures++;
            }
        });
        const avgAttendance = countWithLectures > 0
            ? parseFloat((totalPercentage / countWithLectures).toFixed(1))
            : null;

        const recentStudents = await Student.find()
            .sort({ _id: -1 })
            .limit(5)
            .select('name rollNumber program semester');

        res.status(200).json({
            stats: {
                totalStudents,
                totalTeachers,
                activeCourses,
                avgAttendance
            },
            enrollmentByDepartment,
            recentStudents
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/admin/students
const getStudents = async (req, res) => {
    try {
        const students = await Student.find().select('-password');
        res.status(200).json({ total: students.length, students });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/admin/students/:id
const getStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).select('-password');
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json({ student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// POST /api/admin/students
const createStudent = async (req, res) => {
    try {
        const {
            name, email, password, rollNumber,
            department, program, semester,
            batch, section, phone, address, cnic, dob, guardian
        } = req.body;

        const exists = await Student.findOne({ $or: [{ email }, { rollNumber }] });
        if (exists) return res.status(400).json({ message: 'Email or roll number already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await Student.create({
            name, email,
            password: hashedPassword,
            rollNumber, department, program, semester,
            batch: batch || null,
            section: section || null,
            phone: phone || null,
            address: address || null,
            cnic: cnic || null,
            dob: dob || null,
            guardian: guardian || {}
        });

        const studentObj = student.toObject();
        delete studentObj.password;

        res.status(201).json({ message: 'Student created', student: studentObj });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PATCH /api/admin/students/:id
const updateStudent = async (req, res) => {
    try {
        const allowed = [
            'name', 'email', 'rollNumber', 'department',
            'program', 'semester', 'batch', 'section',
            'phone', 'address', 'cnic', 'dob', 'guardian'
        ];
        const updates = {};
        allowed.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!student) return res.status(404).json({ message: 'Student not found' });

        res.status(200).json({ message: 'Student updated', student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// DELETE /api/admin/students/:id
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        await Enrollment.deleteMany({ student: req.params.id });

        res.status(200).json({ message: 'Student deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/admin/teachers
const getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find().select('-password');
        res.status(200).json({ total: teachers.length, teachers });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/admin/teachers/:id
const getTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id).select('-password');
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        res.status(200).json({ teacher });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// POST /api/admin/teachers
const createTeacher = async (req, res) => {
    try {
        const { name, email, password, employeeId, department } = req.body;

        const exists = await Teacher.findOne({ $or: [{ email }, { employeeId }] });
        if (exists) return res.status(400).json({ message: 'Email or employee ID already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const teacher = await Teacher.create({
            name, email,
            password: hashedPassword,
            employeeId, department
        });

        const teacherObj = teacher.toObject();
        delete teacherObj.password;

        res.status(201).json({ message: 'Teacher created', teacher: teacherObj });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PATCH /api/admin/teachers/:id
const updateTeacher = async (req, res) => {
    try {
        const allowed = ['name', 'email', 'employeeId', 'department'];
        const updates = {};
        allowed.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const teacher = await Teacher.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        res.status(200).json({ message: 'Teacher updated', teacher });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// DELETE /api/admin/teachers/:id
const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        res.status(200).json({ message: 'Teacher deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/admin/courses
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('sections.teacher', 'name email employeeId')
            .populate('prerequisites', 'courseCode name');
        res.status(200).json({ total: courses.length, courses });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/admin/courses/:id
const getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('sections.teacher', 'name email employeeId')
            .populate('prerequisites', 'courseCode name');
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json({ course });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// POST /api/admin/courses
const createCourse = async (req, res) => {
    try {
        const {
            courseCode, name, creditHours,
            department, prerequisites, fee,
            weightage, sections
        } = req.body;

        const exists = await Course.findOne({ courseCode });
        if (exists) return res.status(400).json({ message: 'Course code already exists' });

        const course = await Course.create({
            courseCode, name, creditHours,
            department,
            prerequisites: prerequisites || [],
            fee,
            weightage: weightage || [],
            sections: sections || []
        });

        res.status(201).json({ message: 'Course created', course });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PATCH /api/admin/courses/:id
const updateCourse = async (req, res) => {
    try {
        const allowed = [
            'name', 'creditHours', 'department',
            'prerequisites', 'fee', 'weightage', 'sections'
        ];
        const updates = {};
        allowed.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        )
            .populate('sections.teacher', 'name email')
            .populate('prerequisites', 'courseCode name');

        if (!course) return res.status(404).json({ message: 'Course not found' });

        res.status(200).json({ message: 'Course updated', course });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// DELETE /api/admin/courses/:id
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        await Enrollment.deleteMany({ course: req.params.id });

        res.status(200).json({ message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// POST /api/admin/enrollments
const enrollStudentHandler = async (req, res) => {
    try {
        const { studentId, courseId, sectionId, semester } = req.body;

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const enrollment = await enrollStudent(studentId, courseId, sectionId, semester);
        res.status(201).json({ message: 'Student enrolled successfully', enrollment });

    } catch (error) {
        if (error.message === 'COURSE_NOT_FOUND') return res.status(404).json({ message: 'Course not found' });
        if (error.message === 'SECTION_NOT_FOUND') return res.status(404).json({ message: 'Section not found' });
        if (error.message === 'ALREADY_ENROLLED') return res.status(400).json({ message: 'Student already enrolled in this course' });
        if (error.message === 'NO_SEATS') return res.status(400).json({ message: 'No seats available in this section' });
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// DELETE /api/admin/enrollments/:id
const unenrollStudentHandler = async (req, res) => {
    try {
        await unenrollStudent(req.params.id);
        res.status(200).json({ message: 'Student unenrolled successfully' });
    } catch (error) {
        if (error.message === 'ENROLLMENT_NOT_FOUND') return res.status(404).json({ message: 'Enrollment not found' });
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/admin/announcements
const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .populate('createdBy', 'name')
            .populate('course', 'courseCode name')
            .sort({ createdAt: -1 });

        res.status(200).json({ announcements });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// POST /api/admin/announcements
const postAnnouncement = async (req, res) => {
    try {
        const { title, body, type, course, weekNumber, category } = req.body;

        const announcement = await Announcement.create({
            title,
            body,
            createdBy: req.user.id,
            createdByModel: 'Admin',
            type: type || 'university',
            course: course || null,
            weekNumber: weekNumber || null,
            category: category || 'notice'
        });

        res.status(201).json({ message: 'Announcement posted', announcement });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getDashboard,
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    getTeachers,
    getTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollStudentHandler,
    unenrollStudentHandler,
    getAnnouncements,
    postAnnouncement
};