const CourseRepo = require('../repositories/course.repository');
const EnrollmentRepo = require('../repositories/enrollment.repository');
const AnnouncementRepo = require('../repositories/announcement.repository');
const GradeService = require('../services/grade.service');
const AttendanceService = require('../services/attendance.service');
const ScheduleService = require('../services/schedule.service');
const EnrollmentService = require('../services/enrollment.service');

class TeacherController {
    async getProfile(req, res) {
        try {
            const TeacherRepo = require('../repositories/teacher.repository');
            const teacher = await TeacherRepo.findById(req.user.id);
            if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

            const courses = await CourseRepo.findByTeacher(req.user.id);
            let totalSections = 0;
            let totalStudents = 0;

            for (const course of courses) {
                const teacherSections = course.sections.filter(
                    s => s.teacher.toString() === req.user.id
                );
                totalSections += teacherSections.length;
                for (const section of teacherSections) {
                    const count = await EnrollmentRepo.countBySection(course._id, section._id);
                    totalStudents += count;
                }
            }

            res.status(200).json({ teacher, stats: { totalSections, totalStudents } });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getDashboard(req, res) {
        try {
            const courses = await CourseRepo.findByTeacher(req.user.id);
            const sections = [];

            for (const course of courses) {
                const teacherSections = course.sections.filter(
                    s => s.teacher.toString() === req.user.id
                );
                for (const section of teacherSections) {
                    const studentCount = await EnrollmentRepo.countBySection(course._id, section._id);
                    sections.push({
                        courseId: course._id,
                        sectionId: section._id,
                        courseCode: course.courseCode,
                        courseName: course.name,
                        sectionName: section.sectionName,
                        creditHours: course.creditHours,
                        studentCount,
                        schedule: section.schedule
                    });
                }
            }

            const announcementsCount = await AnnouncementRepo.countByCreator(req.user.id);

            const pendingGrades = await EnrollmentRepo.findByCourseIds(courses.map(c => c._id));
            const pending = pendingGrades.filter(e => e.letterGrade === null);
            await Promise.all(pending.map(e => e.populate('student', 'name rollNumber').then(() => e.populate('course', 'courseCode name'))));

            const pendingTasks = pending.map(e => ({
                studentName: e.student.name,
                rollNumber: e.student.rollNumber,
                courseCode: e.course.courseCode,
                courseName: e.course.name
            }));

            res.status(200).json({
                totalSections: sections.length,
                totalStudents: sections.reduce((sum, s) => sum + s.studentCount, 0),
                announcementsCount,
                pendingTasksCount: pendingTasks.length,
                sections,
                pendingTasks
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getSections(req, res) {
        try {
            const courses = await CourseRepo.findByTeacher(req.user.id);
            const sections = [];

            for (const course of courses) {
                const teacherSections = course.sections.filter(
                    s => s.teacher.toString() === req.user.id
                );
                for (const section of teacherSections) {
                    const studentCount = await EnrollmentRepo.countBySection(course._id, section._id);
                    sections.push({
                        courseId: course._id,
                        sectionId: section._id,
                        courseCode: course.courseCode,
                        courseName: course.name,
                        creditHours: course.creditHours,
                        department: course.department,
                        sectionName: section.sectionName,
                        totalSeats: section.totalSeats,
                        seatsAvailable: section.seatsAvailable,
                        schedule: section.schedule,
                        studentCount
                    });
                }
            }

            res.status(200).json({ sections });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getSectionStudents(req, res) {
        try {
            const { sectionId } = req.params;
            const course = await CourseRepo.findOneBySection(sectionId, req.user.id);
            if (!course) return res.status(403).json({ message: 'Access denied' });

            const enrollments = await EnrollmentRepo.findActiveBySectionPopulated(course._id, sectionId);
            const students = enrollments.map(e => ({
                enrollmentId: e._id,
                studentId: e.student._id,
                name: e.student.name,
                rollNumber: e.student.rollNumber,
                email: e.student.email,
                semester: e.student.semester,
                letterGrade: e.letterGrade,
                gradePoints: e.gradePoints,
                attendancePercentage: AttendanceService.calcAttendancePercentage(
                    e.attendance.attendedLectures,
                    e.attendance.totalLectures
                )
            }));

            const section = course.sections.id(sectionId);
            res.status(200).json({
                courseCode: course.courseCode,
                courseName: course.name,
                sectionName: section.sectionName,
                totalStudents: students.length,
                students
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getGradebook(req, res) {
        try {
            const { sectionId } = req.params;
            const course = await CourseRepo.findOneBySection(sectionId, req.user.id);
            if (!course) return res.status(403).json({ message: 'Access denied' });

            const enrollments = await EnrollmentRepo.findActiveBySectionPopulated(course._id, sectionId);
            const section = course.sections.id(sectionId);

            const gradebook = enrollments.map(enrollment => {
                const assessmentsByType = GradeService.groupAssessmentsByType(enrollment.assessments);
                const totalPercentage = GradeService.calculateWeightedPercentage(assessmentsByType, course.weightage);
                return {
                    enrollmentId: enrollment._id,
                    studentName: enrollment.student.name,
                    rollNumber: enrollment.student.rollNumber,
                    assessments: assessmentsByType,
                    totalPercentage,
                    letterGrade: enrollment.letterGrade,
                    gradePoints: enrollment.gradePoints
                };
            });

            res.status(200).json({
                courseCode: course.courseCode,
                courseName: course.name,
                sectionName: section.sectionName,
                weightage: course.weightage,
                gradebook
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async updateGrades(req, res) {
        try {
            const { sectionId } = req.params;
            const { enrollmentId, assessments, letterGrade, gradePoints } = req.body;

            const course = await CourseRepo.findOneBySection(sectionId, req.user.id);
            if (!course) return res.status(403).json({ message: 'Access denied' });

            const enrollment = await EnrollmentRepo.findById(enrollmentId);
            if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

            if (assessments && Array.isArray(assessments)) {
                assessments.forEach(({ assessmentId, obtainedMarks }) => {
                    const assessment = enrollment.assessments.id(assessmentId);
                    if (assessment) assessment.obtainedMarks = obtainedMarks;
                });
            }

            if (letterGrade !== undefined) enrollment.letterGrade = letterGrade;
            if (gradePoints !== undefined) enrollment.gradePoints = gradePoints;

            await EnrollmentRepo.save(enrollment);
            res.status(200).json({ message: 'Grades updated', enrollment });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getAttendance(req, res) {
        try {
            const { sectionId } = req.params;
            const course = await CourseRepo.findOneBySection(sectionId, req.user.id);
            if (!course) return res.status(403).json({ message: 'Access denied' });

            const enrollments = await EnrollmentRepo.findActiveBySectionPopulated(course._id, sectionId);
            const section = course.sections.id(sectionId);

            const attendance = enrollments.map(enrollment => {
                const { totalLectures, attendedLectures, tardies, classLog } = enrollment.attendance;
                const percentage = AttendanceService.calcAttendancePercentage(attendedLectures, totalLectures);
                return {
                    enrollmentId: enrollment._id,
                    studentName: enrollment.student.name,
                    rollNumber: enrollment.student.rollNumber,
                    totalLectures,
                    attendedLectures,
                    absent: totalLectures - attendedLectures,
                    tardies,
                    percentage,
                    isAtRisk: AttendanceService.isAtRisk(percentage),
                    classLog
                };
            });

            res.status(200).json({
                courseCode: course.courseCode,
                courseName: course.name,
                sectionName: section.sectionName,
                attendance
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async markAttendance(req, res) {
        try {
            const { sectionId } = req.params;
            const { date, topic, records } = req.body;

            const course = await CourseRepo.findOneBySection(sectionId, req.user.id);
            if (!course) return res.status(403).json({ message: 'Access denied' });

            for (const record of records) {
                const enrollment = await EnrollmentRepo.findById(record.enrollmentId);
                if (!enrollment) continue;

                enrollment.attendance.classLog.push({
                    date: new Date(date),
                    topic: topic || null,
                    status: record.status
                });

                enrollment.attendance.totalLectures += 1;
                if (record.status === 'present') {
                    enrollment.attendance.attendedLectures += 1;
                } else if (record.status === 'tardy') {
                    enrollment.attendance.attendedLectures += 1;
                    enrollment.attendance.tardies += 1;
                }

                await EnrollmentRepo.save(enrollment);
            }

            res.status(200).json({ message: 'Attendance marked successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getSchedule(req, res) {
        try {
            const courses = await CourseRepo.findByTeacher(req.user.id);
            const schedule = [];

            courses.forEach(course => {
                const teacherSections = course.sections.filter(
                    s => s.teacher.toString() === req.user.id
                );
                teacherSections.forEach(section => {
                    section.schedule.forEach(slot => {
                        schedule.push({
                            day: slot.day,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            room: slot.room,
                            courseCode: course.courseCode,
                            courseName: course.name,
                            sectionName: section.sectionName,
                            creditHours: course.creditHours
                        });
                    });
                });
            });

            ScheduleService.sortByDayAndTime(schedule);
            res.status(200).json({ schedule });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getAnnouncements(req, res) {
        try {
            const announcements = await AnnouncementRepo.findByCreator(req.user.id);
            res.status(200).json({ announcements });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async postAnnouncement(req, res) {
        try {
            const { title, body, type, course, weekNumber, category } = req.body;

            if (type === 'faculty' && !course) {
                return res.status(400).json({ message: 'Course is required for faculty announcements' });
            }

            if (type === 'faculty' && course) {
                const courseExists = await CourseRepo.findOneBySection(course, req.user.id);
                if (!courseExists) return res.status(403).json({ message: 'Access denied' });
            }

            const announcement = await AnnouncementRepo.create({
                title, body,
                createdBy: req.user.id,
                createdByModel: 'Teacher',
                type,
                course: course || null,
                weekNumber: weekNumber || null,
                category: category || 'notice'
            });

            res.status(201).json({ message: 'Announcement posted', announcement });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

const controller = new TeacherController();
module.exports = {
    getProfile: controller.getProfile.bind(controller),
    getDashboard: controller.getDashboard.bind(controller),
    getSections: controller.getSections.bind(controller),
    getSectionStudents: controller.getSectionStudents.bind(controller),
    getGradebook: controller.getGradebook.bind(controller),
    updateGrades: controller.updateGrades.bind(controller),
    getAttendance: controller.getAttendance.bind(controller),
    markAttendance: controller.markAttendance.bind(controller),
    getSchedule: controller.getSchedule.bind(controller),
    getAnnouncements: controller.getAnnouncements.bind(controller),
    postAnnouncement: controller.postAnnouncement.bind(controller)
};