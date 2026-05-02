const StudentRepo = require('../repositories/student.repository');
const EnrollmentRepo = require('../repositories/enrollment.repository');
const AnnouncementRepo = require('../repositories/announcement.repository');
const GradeService = require('../services/grade.service');
const AttendanceService = require('../services/attendance.service');
const ScheduleService = require('../services/schedule.service');
const AnnouncementAdapter = require('../patterns/AnnouncementAdapter');


class StudentController {
    async getProfile(req, res) {
        try {
            const student = await StudentRepo.findById(req.user.id);
            if (!student) return res.status(404).json({ message: 'Student not found' });
            res.status(200).json({ student });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const allowed = ['address', 'phone', 'cnic', 'dob', 'guardian'];
            const updates = {};
            allowed.forEach(field => {
                if (req.body[field] !== undefined) updates[field] = req.body[field];
            });
            const student = await StudentRepo.updateById(req.user.id, updates);
            if (!student) return res.status(404).json({ message: 'Student not found' });
            res.status(200).json({ message: 'Profile updated', student });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getCourses(req, res) {
        try {
            const enrollments = await EnrollmentRepo.findActiveByStudent(req.user.id);
            await Promise.all(enrollments.map(e => e.populate({
                path: 'course',
                populate: { path: 'sections.teacher', model: 'Teacher', select: 'name email' }
            })));

            const courses = enrollments.map(enrollment => {
                const course = enrollment.course;
                const section = course.sections.id(enrollment.sectionId);
                return {
                    enrollmentId: enrollment._id,
                    courseCode: course.courseCode,
                    name: course.name,
                    creditHours: course.creditHours,
                    fee: course.fee,
                    section: section?.sectionName,
                    teacher: section?.teacher,
                    schedule: section?.schedule,
                    seatsAvailable: section?.seatsAvailable,
                    totalSeats: section?.totalSeats,
                    weightage: course.weightage,
                    letterGrade: enrollment.letterGrade,
                    semester: enrollment.semester
                };
            });

            res.status(200).json({ courses });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getGrades(req, res) {
        try {
            const enrollments = await EnrollmentRepo.findByStudentPopulatedCourse(req.user.id);

            const grades = enrollments.map(enrollment => {
                const assessmentsByType = GradeService.groupAssessmentsByType(enrollment.assessments);
                return {
                    courseCode: enrollment.course.courseCode,
                    courseName: enrollment.course.name,
                    creditHours: enrollment.course.creditHours,
                    weightage: enrollment.course.weightage,
                    semester: enrollment.semester,
                    isCompleted: enrollment.isCompleted,
                    assessments: assessmentsByType,
                    letterGrade: enrollment.letterGrade,
                    gradePoints: enrollment.gradePoints
                };
            });

            res.status(200).json({ grades });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getAttendance(req, res) {
        try {
            const enrollments = await EnrollmentRepo.findActiveByStudentPopulated(req.user.id, 'courseCode name');

            const attendance = enrollments.map(enrollment => {
                const { totalLectures, attendedLectures, tardies, classLog } = enrollment.attendance;
                const percentage = AttendanceService.calcAttendancePercentage(attendedLectures, totalLectures);
                return {
                    enrollmentId: enrollment._id,
                    courseCode: enrollment.course.courseCode,
                    courseName: enrollment.course.name,
                    semester: enrollment.semester,
                    totalLectures,
                    attendedLectures,
                    tardies,
                    percentage,
                    classLog
                };
            });

            res.status(200).json({ attendance });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getGPA(req, res) {
        try {
            const student = await StudentRepo.findById(req.user.id);
            const enrollments = await EnrollmentRepo.findActiveByStudentPopulated(req.user.id, 'creditHours');

            const semesterMap = {};
            enrollments.forEach(enrollment => {
                const sem = enrollment.semester;
                if (!semesterMap[sem]) semesterMap[sem] = { qualityPoints: 0, credits: 0 };
                const credits = enrollment.course.creditHours;
                const gp = enrollment.gradePoints ?? 0;
                semesterMap[sem].qualityPoints += credits * gp;
                semesterMap[sem].credits += credits;
            });

            const semesterGPAs = Object.entries(semesterMap).map(([semester, data]) => ({
                semester,
                gpa: data.credits > 0 ? parseFloat((data.qualityPoints / data.credits).toFixed(2)) : null
            }));

            const cgpa = GradeService.calculateCGPA(enrollments);
            const completed = enrollments.filter(e => e.isCompleted);
            const inProgress = enrollments.filter(e => !e.isCompleted);
            const creditsCompleted = completed.reduce((sum, e) => sum + e.course.creditHours, 0);
            const creditsInProgress = inProgress.reduce((sum, e) => sum + e.course.creditHours, 0);

            res.status(200).json({
                cgpa,
                semesterGPAs,
                creditsCompleted,
                creditsInProgress,
                creditsRemaining: student.totalCreditsRequired - creditsCompleted - creditsInProgress,
                totalCreditsRequired: student.totalCreditsRequired
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getTranscript(req, res) {
        try {
            const student = await StudentRepo.findById(req.user.id);
            if (!student) return res.status(404).json({ message: 'Student not found' });

            const completedEnrollments = await EnrollmentRepo.findCompletedByStudent(req.user.id);

            let totalCreditsEarned = 0;
            const completedCourses = completedEnrollments.map(enrollment => {
                const credits = enrollment.course.creditHours;
                if (enrollment.letterGrade && enrollment.letterGrade !== 'F') {
                    totalCreditsEarned += credits;
                }
                return {
                    courseCode: enrollment.course.courseCode,
                    courseName: enrollment.course.name,
                    creditHours: credits,
                    semester: enrollment.semester,
                    letterGrade: enrollment.letterGrade,
                    gradePoints: enrollment.gradePoints
                };
            });

            const cgpa = GradeService.calculateCGPA(completedEnrollments);

            res.status(200).json({
                student: {
                    name: student.name,
                    rollNumber: student.rollNumber,
                    program: student.program,
                    department: student.department,
                    batch: student.batch
                },
                cgpa,
                totalCreditsEarned,
                totalCreditsRequired: student.totalCreditsRequired,
                completedCourses
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getTimetable(req, res) {
        try {
            const enrollments = await EnrollmentRepo.findActiveByStudent(req.user.id);
            await Promise.all(enrollments.map(e => e.populate({
                path: 'course',
                populate: { path: 'sections.teacher', model: 'Teacher', select: 'name' }
            })));

            const timetable = [];
            enrollments.forEach(enrollment => {
                const course = enrollment.course;
                const section = course.sections.id(enrollment.sectionId);
                if (!section) return;
                section.schedule.forEach(slot => {
                    timetable.push({
                        day: slot.day,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        room: slot.room,
                        courseCode: course.courseCode,
                        courseName: course.name,
                        section: section.sectionName,
                        teacher: section.teacher?.name ?? null
                    });
                });
            });

            ScheduleService.sortByDayAndTime(timetable);
            res.status(200).json({ timetable });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getAnnouncements(req, res) {
    try {
        const enrollments = await EnrollmentRepo.findActiveByStudent(req.user.id);
        const enrolledCourseIds = enrollments.map(e => e.course);
        const announcements = await AnnouncementRepo.findForStudent(enrolledCourseIds, req.query.week);
        res.status(200).json({ announcements: AnnouncementAdapter.adaptMany(announcements) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
}

const controller = new StudentController();
module.exports = {
    getProfile: controller.getProfile.bind(controller),
    updateProfile: controller.updateProfile.bind(controller),
    getCourses: controller.getCourses.bind(controller),
    getGrades: controller.getGrades.bind(controller),
    getAttendance: controller.getAttendance.bind(controller),
    getGPA: controller.getGPA.bind(controller),
    getAnnouncements: controller.getAnnouncements.bind(controller),
    getTranscript: controller.getTranscript.bind(controller),
    getTimetable: controller.getTimetable.bind(controller)
};