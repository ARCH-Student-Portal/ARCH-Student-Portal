const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

const enrollStudent = async (studentId, courseId, sectionId, semester) => {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('COURSE_NOT_FOUND');

    const section = course.sections.id(sectionId);
    if (!section) throw new Error('SECTION_NOT_FOUND');

    const alreadyEnrolled = await Enrollment.findOne({
        student: studentId,
        course: courseId,
        isCompleted: false
    });
    if (alreadyEnrolled) throw new Error('ALREADY_ENROLLED');

    if (section.seatsAvailable <= 0) throw new Error('NO_SEATS');

    const enrollment = await Enrollment.create({
        student: studentId,
        course: courseId,
        sectionId,
        semester
    });

    section.seatsAvailable -= 1;
    await course.save();

    return enrollment;
};

const unenrollStudent = async (enrollmentId) => {
    const enrollment = await Enrollment.findByIdAndDelete(enrollmentId);
    if (!enrollment) throw new Error('ENROLLMENT_NOT_FOUND');

    const course = await Course.findById(enrollment.course);
    if (course) {
        const section = course.sections.id(enrollment.sectionId);
        if (section) {
            section.seatsAvailable += 1;
            await course.save();
        }
    }

    return enrollment;
};

module.exports = { enrollStudent, unenrollStudent };