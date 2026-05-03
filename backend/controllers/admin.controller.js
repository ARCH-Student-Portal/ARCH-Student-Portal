const UserFactory = require('../patterns/UserFactory');
const StudentRepo = require('../repositories/student.repository');
const TeacherRepo = require('../repositories/teacher.repository');
const CourseRepo = require('../repositories/course.repository');
const EnrollmentRepo = require('../repositories/enrollment.repository');
const AnnouncementRepo = require('../repositories/announcement.repository');
const AuthService = require('../services/auth.service');
const EnrollmentService = require('../services/enrollment.service');
const AnnouncementAdapter = require('../patterns/AnnouncementAdapter');
const PaginationIterator = require('../patterns/PaginationIterator');
const EnrollmentState = require('../patterns/EnrollmentState');

// admin.controller.js — postAnnouncement
const postAnnouncement = async (req, res) => {
  try {
    const { title, body, type, category, course, weekNumber } = req.body;

    const ann = await Announcement.create({
      title,
      body,
      type,                        // now correctly "university" | "faculty"
      category:    category || "notice",
      createdBy:   req.user.id,    // from JWT via verifyToken
      createdByModel: "Admin",     // hardcoded — admin route
      course:      course || null,
      weekNumber:  weekNumber || null,
    });

    res.status(201).json({ success: true, data: ann });
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

class AdminController {
    async getDashboard(req, res) {
        try {
            const totalStudents = await StudentRepo.countAll();
            const totalTeachers = await TeacherRepo.countAll();
            const activeCourses = await CourseRepo.countAll();

            const students = await StudentRepo.findAllSelect('department');
            const departmentMap = {};
            students.forEach(s => {
                if (!departmentMap[s.department]) departmentMap[s.department] = 0;
                departmentMap[s.department]++;
            });
            const enrollmentByDepartment = Object.entries(departmentMap).map(
                ([department, count]) => ({ department, count })
            );

            const enrollments = await EnrollmentRepo.findByCourseIds(
                (await CourseRepo.findAll()).map(c => c._id)
            );
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

            const recentStudents = await StudentRepo.findRecentLimit(5);

            res.status(200).json({
                stats: { totalStudents, totalTeachers, activeCourses, avgAttendance },
                enrollmentByDepartment,
                recentStudents
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getStudents(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        const students = await StudentRepo.findAll();
        const iterator = new PaginationIterator(students, pageSize);
        const paginated = iterator.getPage(page);

        res.status(200).json({
            students: paginated,
            meta: { ...iterator.getMeta(), currentPage: page }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

    async getStudent(req, res) {
        try {
            const student = await StudentRepo.findById(req.params.id);
            if (!student) return res.status(404).json({ message: 'Student not found' });
            res.status(200).json({ student });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async createStudent(req, res) {
    try {
        const student = await UserFactory.createUser('student', req.body);
        const studentObj = student.toObject();
        delete studentObj.password;
        res.status(201).json({ message: 'Student created', student: studentObj });
    } catch (error) {
        if (error.message === 'DUPLICATE_STUDENT') return res.status(400).json({ message: 'Email or roll number already exists' });
        if (error.message === 'INVALID_ROLE') return res.status(400).json({ message: 'Invalid role' });
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

    async updateStudent(req, res) {
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

            const student = await StudentRepo.updateById(req.params.id, updates);
            if (!student) return res.status(404).json({ message: 'Student not found' });
            res.status(200).json({ message: 'Student updated', student });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async completeEnrollment(req, res) {
    try {
        const { letterGrade, gradePoints } = req.body;
        const enrollment = await EnrollmentRepo.findById(req.params.id);
        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

        const state = new EnrollmentState(enrollment);
        const result = await state.complete(letterGrade, gradePoints);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async dropEnrollment(req, res) {
    try {
        const enrollment = await EnrollmentRepo.findById(req.params.id);
        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

        const state = new EnrollmentState(enrollment);
        const result = await state.drop();
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async reactivateEnrollment(req, res) {
    try {
        const enrollment = await EnrollmentRepo.findById(req.params.id);
        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

        const state = new EnrollmentState(enrollment);
        const result = await state.reactivate();
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


    async deleteStudent(req, res) {
        try {
            const student = await StudentRepo.deleteById(req.params.id);
            if (!student) return res.status(404).json({ message: 'Student not found' });
            await EnrollmentRepo.deleteByStudent(req.params.id);
            res.status(200).json({ message: 'Student deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getTeachers(req, res) {
        try {
            const teachers = await TeacherRepo.findAll();
            res.status(200).json({ total: teachers.length, teachers });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getTeacher(req, res) {
        try {
            const teacher = await TeacherRepo.findById(req.params.id);
            if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
            res.status(200).json({ teacher });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async createTeacher(req, res) {
    try {
        const teacher = await UserFactory.createUser('teacher', req.body);
        const teacherObj = teacher.toObject();
        delete teacherObj.password;
        res.status(201).json({ message: 'Teacher created', teacher: teacherObj });
    } catch (error) {
        if (error.message === 'DUPLICATE_TEACHER') return res.status(400).json({ message: 'Email or employee ID already exists' });
        if (error.message === 'INVALID_ROLE') return res.status(400).json({ message: 'Invalid role' });
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

    async updateTeacher(req, res) {
        try {
            const allowed = ['name', 'email', 'employeeId', 'department'];
            const updates = {};
            allowed.forEach(field => {
                if (req.body[field] !== undefined) updates[field] = req.body[field];
            });

            const teacher = await TeacherRepo.updateById(req.params.id, updates);
            if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
            res.status(200).json({ message: 'Teacher updated', teacher });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async deleteTeacher(req, res) {
        try {
            const teacher = await TeacherRepo.deleteById(req.params.id);
            if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
            res.status(200).json({ message: 'Teacher deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getCourses(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        const courses = await CourseRepo.findAll();
        const iterator = new PaginationIterator(courses, pageSize);
        const paginated = iterator.getPage(page);

        res.status(200).json({
            courses: paginated,
            meta: { ...iterator.getMeta(), currentPage: page }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

    async getCourse(req, res) {
        try {
            const course = await CourseRepo.findById(req.params.id);
            if (!course) return res.status(404).json({ message: 'Course not found' });
            res.status(200).json({ course });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async createCourse(req, res) {
        try {
            const {
                courseCode, name, creditHours,
                department, prerequisites, fee,
                weightage, sections
            } = req.body;

            const exists = await CourseRepo.findByCode(courseCode);
            if (exists) return res.status(400).json({ message: 'Course code already exists' });

            const course = await CourseRepo.create({
                courseCode, name, creditHours, department,
                prerequisites: prerequisites || [],
                fee,
                weightage: weightage || [],
                sections: sections || []
            });

            res.status(201).json({ message: 'Course created', course });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async updateCourse(req, res) {
        try {
            const allowed = [
                'name', 'creditHours', 'department',
                'prerequisites', 'fee', 'weightage', 'sections'
            ];
            const updates = {};
            allowed.forEach(field => {
                if (req.body[field] !== undefined) updates[field] = req.body[field];
            });

            const course = await CourseRepo.updateById(req.params.id, updates);
            if (!course) return res.status(404).json({ message: 'Course not found' });
            res.status(200).json({ message: 'Course updated', course });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async deleteCourse(req, res) {
        try {
            const course = await CourseRepo.deleteById(req.params.id);
            if (!course) return res.status(404).json({ message: 'Course not found' });
            await EnrollmentRepo.deleteByCourse(req.params.id);
            res.status(200).json({ message: 'Course deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async enrollStudentHandler(req, res) {
        try {
            const { studentId, courseId, sectionId, semester } = req.body;
            const student = await StudentRepo.findById(studentId);
            if (!student) return res.status(404).json({ message: 'Student not found' });

            const enrollment = await EnrollmentService.enrollStudent(studentId, courseId, sectionId, semester);
            res.status(201).json({ message: 'Student enrolled successfully', enrollment });
        } catch (error) {
            if (error.message === 'COURSE_NOT_FOUND') return res.status(404).json({ message: 'Course not found' });
            if (error.message === 'SECTION_NOT_FOUND') return res.status(404).json({ message: 'Section not found' });
            if (error.message === 'ALREADY_ENROLLED') return res.status(400).json({ message: 'Student already enrolled' });
            if (error.message === 'NO_SEATS') return res.status(400).json({ message: 'No seats available' });
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async unenrollStudentHandler(req, res) {
        try {
            await EnrollmentService.unenrollStudent(req.params.id);
            res.status(200).json({ message: 'Student unenrolled successfully' });
        } catch (error) {
            if (error.message === 'ENROLLMENT_NOT_FOUND') return res.status(404).json({ message: 'Enrollment not found' });
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async updateAnnouncement(req, res) {
        try {
            const allowed = ['title', 'body', 'type', 'category', 'weekNumber', 'course'];
            const updates = {};
            allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
            const ann = await AnnouncementRepo.updateById(req.params.id, updates);
            if (!ann) return res.status(404).json({ message: 'Announcement not found' });
            res.status(200).json({ announcement: AnnouncementAdapter.adapt(ann) });
        } catch (err) {
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    }

    async deleteAnnouncement(req, res) {
        
        const ann = await AnnouncementRepo.deleteById(req.params.id);
    if (!ann) return res.status(404).json({ message: 'Announcement not found' });
    try {
        const ann = await AnnouncementRepo.deleteById(req.params.id);
        if (!ann) return res.status(404).json({ message: 'Announcement not found' });
        res.status(200).json({ message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

    async getAnnouncements(req, res) {
    try {
        const announcements = await AnnouncementRepo.findAll();
        res.status(200).json({ announcements: AnnouncementAdapter.adaptMany(announcements) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }

    
}

async postAnnouncement(req, res) {
    try {
        const { title, body, type, course, weekNumber, category } = req.body;
        const announcement = await AnnouncementRepo.create({
            title, body,
            createdBy: req.user.id,
            createdByModel: 'Admin',
            type: type || 'university',
            course: course || null,
            weekNumber: weekNumber || null,
            category: category || 'notice'
        });

        const populated = await announcement.populate([
            { path: 'createdBy', select: 'name' },
            { path: 'course', select: 'courseCode name' }
        ]);

        res.status(201).json({ message: 'Announcement posted', announcement: AnnouncementAdapter.adapt(populated) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
}

const controller = new AdminController();
module.exports = {
    getDashboard: controller.getDashboard.bind(controller),
    getStudents: controller.getStudents.bind(controller),
    getStudent: controller.getStudent.bind(controller),
    createStudent: controller.createStudent.bind(controller),
    updateStudent: controller.updateStudent.bind(controller),
    deleteStudent: controller.deleteStudent.bind(controller),
    getTeachers: controller.getTeachers.bind(controller),
    getTeacher: controller.getTeacher.bind(controller),
    createTeacher: controller.createTeacher.bind(controller),
    updateTeacher: controller.updateTeacher.bind(controller),
    deleteTeacher: controller.deleteTeacher.bind(controller),
    getCourses: controller.getCourses.bind(controller),
    getCourse: controller.getCourse.bind(controller),
    createCourse: controller.createCourse.bind(controller),
    updateCourse: controller.updateCourse.bind(controller),
    deleteCourse: controller.deleteCourse.bind(controller),
    enrollStudentHandler: controller.enrollStudentHandler.bind(controller),
    unenrollStudentHandler: controller.unenrollStudentHandler.bind(controller),
    getAnnouncements: controller.getAnnouncements.bind(controller),
    postAnnouncement: controller.postAnnouncement.bind(controller),
    completeEnrollment: controller.completeEnrollment.bind(controller),
    deleteAnnouncement: controller.deleteAnnouncement.bind(controller),
    updateAnnouncement: controller.updateAnnouncement.bind(controller),
dropEnrollment: controller.dropEnrollment.bind(controller),
reactivateEnrollment: controller.reactivateEnrollment.bind(controller)
};