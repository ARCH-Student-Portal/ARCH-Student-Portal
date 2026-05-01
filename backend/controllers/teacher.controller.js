const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Announcement = require('../models/Announcement');

// GET /api/teacher/profile
const getProfile = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user.id).select('-password');
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        // find all courses where this teacher has a section
        const courses = await Course.find({
            'sections.teacher': req.user.id
        });

        // count total sections and total students
        let totalSections = 0;
        let totalStudents = 0;

        for (const course of courses) {
            const teacherSections = course.sections.filter(
                s => s.teacher.toString() === req.user.id
            );
            totalSections += teacherSections.length;

            for (const section of teacherSections) {
                const count = await Enrollment.countDocuments({
                    course: course._id,
                    sectionId: section._id,
                    isCompleted: false
                });
                totalStudents += count;
            }
        }

        res.status(200).json({
            teacher,
            stats: {
                totalSections,
                totalStudents
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/teacher/dashboard
const getDashboard = async (req, res) => {
    try {
        // find all courses where this teacher has a section
        const courses = await Course.find({
            'sections.teacher': req.user.id
        }).populate('sections.teacher', 'name');

        // build sections list with student counts
        const sections = [];
        for (const course of courses) {
            const teacherSections = course.sections.filter(
                s => s.teacher._id.toString() === req.user.id
            );

            for (const section of teacherSections) {
                const studentCount = await Enrollment.countDocuments({
                    course: course._id,
                    sectionId: section._id,
                    isCompleted: false
                });

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

        // count announcements posted by this teacher
        const announcementsCount = await Announcement.countDocuments({
            createdBy: req.user.id
        });

        // find pending tasks — enrollments with no grades entered yet
        const pendingGrades = await Enrollment.find({
            course: { $in: courses.map(c => c._id) },
            isCompleted: false,
            letterGrade: null
        }).populate('student', 'name rollNumber')
          .populate('course', 'courseCode name');

        const pendingTasks = pendingGrades.map(e => ({
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
};

// GET /api/teacher/sections/:sectionId/gradebook
const getGradebook = async (req, res) => {
    try {
        const { sectionId } = req.params;

        // verify section belongs to this teacher
        const course = await Course.findOne({
            'sections._id': sectionId,
            'sections.teacher': req.user.id
        });

        if (!course) return res.status(403).json({ message: 'Access denied' });

        const enrollments = await Enrollment.find({
            course: course._id,
            sectionId,
            isCompleted: false
        }).populate('student', 'name rollNumber');

        const section = course.sections.id(sectionId);

        // build gradebook rows
        const gradebook = enrollments.map(enrollment => {
            // group assessments by type
            const assessmentsByType = {};
            enrollment.assessments.forEach(assessment => {
                if (!assessmentsByType[assessment.type]) {
                    assessmentsByType[assessment.type] = [];
                }
                assessmentsByType[assessment.type].push({
                    assessmentId: assessment._id,
                    title: assessment.title,
                    totalMarks: assessment.totalMarks,
                    obtainedMarks: assessment.obtainedMarks
                });
            });

            // calculate weighted percentage
            let totalPercentage = 0;
            course.weightage.forEach(w => {
                const assessments = assessmentsByType[w.type] || [];
                if (assessments.length === 0) return;

                const totalObtained = assessments.reduce((sum, a) => sum + a.obtainedMarks, 0);
                const totalMarks = assessments.reduce((sum, a) => sum + a.totalMarks, 0);
                const typePercentage = (totalObtained / totalMarks) * w.percentage;
                totalPercentage += typePercentage;
            });

            return {
                enrollmentId: enrollment._id,
                studentName: enrollment.student.name,
                rollNumber: enrollment.student.rollNumber,
                assessments: assessmentsByType,
                totalPercentage: parseFloat(totalPercentage.toFixed(1)),
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
};

// PATCH /api/teacher/sections/:sectionId/grades
const updateGrades = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const { enrollmentId, assessments, letterGrade, gradePoints } = req.body;

        // verify section belongs to this teacher
        const course = await Course.findOne({
            'sections._id': sectionId,
            'sections.teacher': req.user.id
        });

        if (!course) return res.status(403).json({ message: 'Access denied' });

        const enrollment = await Enrollment.findById(enrollmentId);
        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

        // update individual assessments if provided
        if (assessments && Array.isArray(assessments)) {
            assessments.forEach(({ assessmentId, obtainedMarks }) => {
                const assessment = enrollment.assessments.id(assessmentId);
                if (assessment) {
                    assessment.obtainedMarks = obtainedMarks;
                }
            });
        }

        // update letter grade and grade points if provided
        if (letterGrade !== undefined) enrollment.letterGrade = letterGrade;
        if (gradePoints !== undefined) enrollment.gradePoints = gradePoints;

        await enrollment.save();

        res.status(200).json({ message: 'Grades updated', enrollment });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/teacher/sections/:sectionId/attendance
const getAttendance = async (req, res) => {
    try {
        const { sectionId } = req.params;

        // verify section belongs to this teacher
        const course = await Course.findOne({
            'sections._id': sectionId,
            'sections.teacher': req.user.id
        });

        if (!course) return res.status(403).json({ message: 'Access denied' });

        const enrollments = await Enrollment.find({
            course: course._id,
            sectionId,
            isCompleted: false
        }).populate('student', 'name rollNumber');

        const section = course.sections.id(sectionId);

        const attendance = enrollments.map(enrollment => {
            const { totalLectures, attendedLectures, tardies, classLog } = enrollment.attendance;
            const percentage = totalLectures > 0
                ? parseFloat(((attendedLectures / totalLectures) * 100).toFixed(1))
                : null;

            return {
                enrollmentId: enrollment._id,
                studentName: enrollment.student.name,
                rollNumber: enrollment.student.rollNumber,
                totalLectures,
                attendedLectures,
                absent: totalLectures - attendedLectures,
                tardies,
                percentage,
                isAtRisk: percentage !== null && percentage < 75,
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
};

// POST /api/teacher/sections/:sectionId/attendance
const markAttendance = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const { date, topic, records } = req.body;
        // records = [{ enrollmentId, status: 'present'|'absent'|'tardy' }]

        // verify section belongs to this teacher
        const course = await Course.findOne({
            'sections._id': sectionId,
            'sections.teacher': req.user.id
        });

        if (!course) return res.status(403).json({ message: 'Access denied' });

        // update each student's attendance
        for (const record of records) {
            const enrollment = await Enrollment.findById(record.enrollmentId);
            if (!enrollment) continue;

            // add to class log
            enrollment.attendance.classLog.push({
                date: new Date(date),
                topic: topic || null,
                status: record.status
            });

            // update counters
            enrollment.attendance.totalLectures += 1;
            if (record.status === 'present') {
                enrollment.attendance.attendedLectures += 1;
            } else if (record.status === 'tardy') {
                enrollment.attendance.attendedLectures += 1;
                enrollment.attendance.tardies += 1;
            }

            await enrollment.save();
        }

        res.status(200).json({ message: 'Attendance marked successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// GET /api/teacher/announcements
const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({
            createdBy: req.user.id
        })
            .populate('course', 'courseCode name')
            .sort({ createdAt: -1 });

        res.status(200).json({ announcements });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// POST /api/teacher/announcements
const postAnnouncement = async (req, res) => {
    try {
        const { title, body, type, course, weekNumber, category } = req.body;

        // if faculty type, course is required
        if (type === 'faculty' && !course) {
            return res.status(400).json({ message: 'Course is required for faculty announcements' });
        }

        // if faculty type, verify course belongs to this teacher
        if (type === 'faculty' && course) {
            const courseExists = await Course.findOne({
                _id: course,
                'sections.teacher': req.user.id
            });
            if (!courseExists) return res.status(403).json({ message: 'Access denied' });
        }

        const announcement = await Announcement.create({
            title,
            body,
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
};

// GET /api/teacher/schedule
const getSchedule = async (req, res) => {
    try {
        const courses = await Course.find({
            'sections.teacher': req.user.id
        });

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

        // sort by day then time
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        schedule.sort((a, b) => {
            const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
            if (dayDiff !== 0) return dayDiff;
            return a.startTime.localeCompare(b.startTime);
        });

        res.status(200).json({ schedule });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getProfile,
    getDashboard,
    getSections,
    getSectionStudents,
    getGradebook,
    updateGrades,
    getAttendance,
    markAttendance,
    getSchedule,
    getAnnouncements,
    postAnnouncement
};