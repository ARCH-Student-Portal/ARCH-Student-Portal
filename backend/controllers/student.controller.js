const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const Announcement = require('../models/Announcement');
const Course = require('../models/Course');

// GET /api/student/profile
const getProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id).select('-password');
        if (!student) return res.status(404).json({ message: 'Student not found' });

        res.status(200).json({ student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/student/courses
const getCourses = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            student: req.user.id,
            isCompleted: false
        }).populate({
            path: 'course',
            populate: {
                path: 'sections.teacher',
                model: 'Teacher',
                select: 'name email'
            }
        });

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
};

// GET /api/student/grades
const getGrades = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            student: req.user.id
        }).populate('course', 'courseCode name creditHours weightage');

        const grades = enrollments.map(enrollment => {
            // group assessments by type
            const assessmentsByType = {};
            enrollment.assessments.forEach(assessment => {
                if (!assessmentsByType[assessment.type]) {
                    assessmentsByType[assessment.type] = [];
                }
                assessmentsByType[assessment.type].push({
                    title: assessment.title,
                    totalMarks: assessment.totalMarks,
                    obtainedMarks: assessment.obtainedMarks
                });
            });

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
};

// GET /api/student/attendance
const getAttendance = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            student: req.user.id,
            isCompleted: false
        }).populate('course', 'courseCode name');

        const attendance = enrollments.map(enrollment => {
            const { totalLectures, attendedLectures, tardies, classLog } = enrollment.attendance;
            const percentage = totalLectures > 0
                ? ((attendedLectures / totalLectures) * 100).toFixed(1)
                : null;

            return {
                enrollmentId: enrollment._id,
                courseCode: enrollment.course.courseCode,
                courseName: enrollment.course.name,
                semester: enrollment.semester,
                totalLectures,
                attendedLectures,
                tardies,
                percentage: percentage ? parseFloat(percentage) : null,
                classLog
            };
        });

        res.status(200).json({ attendance });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/student/announcements?week=7
const getAnnouncements = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            student: req.user.id,
            isCompleted: false
        }).select('course');

        const enrolledCourseIds = enrollments.map(e => e.course);

        // build filter
        const filter = {
            $or: [
                { type: 'university' },
                { type: 'faculty', course: { $in: enrolledCourseIds } }
            ]
        };

        // if week query param is provided, filter by it
        if (req.query.week) {
            filter.weekNumber = parseInt(req.query.week);
        }

        const announcements = await Announcement.find(filter)
            .populate('createdBy', 'name')
            .populate('course', 'courseCode name')
            .sort({ createdAt: -1 });

        res.status(200).json({ announcements });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/student/transcript
const getTranscript = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id).select('-password');
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const completedEnrollments = await Enrollment.find({
            student: req.user.id,
            isCompleted: true
        }).populate('course', 'courseCode name creditHours weightage');

        let totalCreditsEarned = 0;
        let totalQualityPoints = 0;

        const completedCourses = completedEnrollments.map(enrollment => {
            const credits = enrollment.course.creditHours;
            const gp = enrollment.gradePoints ?? 0;

            if (enrollment.letterGrade && enrollment.letterGrade !== 'F') {
                totalCreditsEarned += credits;
            }
            totalQualityPoints += credits * gp;

            return {
                courseCode: enrollment.course.courseCode,
                courseName: enrollment.course.name,
                creditHours: credits,
                semester: enrollment.semester,
                letterGrade: enrollment.letterGrade,
                gradePoints: enrollment.gradePoints
            };
        });

        const totalAttemptedCredits = completedEnrollments.reduce(
            (sum, e) => sum + e.course.creditHours, 0
        );
        const cgpa = totalAttemptedCredits > 0
            ? parseFloat((totalQualityPoints / totalAttemptedCredits).toFixed(2))
            : null;

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
};

// GET /api/student/timetable
const getTimetable = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            student: req.user.id,
            isCompleted: false
        }).populate({
            path: 'course',
            populate: {
                path: 'sections.teacher',
                model: 'Teacher',
                select: 'name'
            }
        });

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

        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        timetable.sort((a, b) => {
            const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
            if (dayDiff !== 0) return dayDiff;
            return a.startTime.localeCompare(b.startTime);
        });

        res.status(200).json({ timetable });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PATCH /api/student/profile
const updateProfile = async (req, res) => {
    try {
        const allowed = ['address', 'phone', 'cnic', 'dob', 'guardian'];
        const updates = {};

        allowed.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const student = await Student.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!student) return res.status(404).json({ message: 'Student not found' });

        res.status(200).json({ message: 'Profile updated', student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// GET /api/student/gpa
const getGPA = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id).select('totalCreditsRequired');

        const enrollments = await Enrollment.find({
            student: req.user.id
        }).populate('course', 'creditHours');

        // GPA per semester
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
            gpa: data.credits > 0
                ? parseFloat((data.qualityPoints / data.credits).toFixed(2))
                : null
        }));

        // Cumulative GPA
        const totalCredits = enrollments.reduce((sum, e) => sum + e.course.creditHours, 0);
        const totalQualityPoints = enrollments.reduce((sum, e) => sum + (e.course.creditHours * (e.gradePoints ?? 0)), 0);
        const cgpa = totalCredits > 0
            ? parseFloat((totalQualityPoints / totalCredits).toFixed(2))
            : null;

        // Credits breakdown
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
};


module.exports = {
    getProfile,
    updateProfile,
    getCourses,
    getGrades,
    getAttendance,
    getGPA,          
    getAnnouncements,
    getTranscript,
    getTimetable
};