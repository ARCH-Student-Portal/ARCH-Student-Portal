const EnrollmentRepo = require('../repositories/enrollment.repository');
const CourseRepo = require('../repositories/course.repository');
const { enrollmentEventBus } = require('../patterns/NotificationObserver');

class EnrollmentService {
    async enrollStudent(studentId, courseId, sectionId, semester) {
        const course = await CourseRepo.findRaw(courseId);
        if (!course) throw new Error('COURSE_NOT_FOUND');

        const section = course.sections.id(sectionId);
        if (!section) throw new Error('SECTION_NOT_FOUND');

        const alreadyEnrolled = await EnrollmentRepo.findOne({
            student: studentId,
            course: courseId,
            isCompleted: false
        });
        if (alreadyEnrolled) throw new Error('ALREADY_ENROLLED');

        if (section.seatsAvailable <= 0) throw new Error('NO_SEATS');

        const enrollment = await EnrollmentRepo.create({
            student: studentId,
            course: courseId,
            sectionId,
            semester
        });

        section.seatsAvailable -= 1;
        await CourseRepo.save(course);

        enrollmentEventBus.emit('enrollment.created', {
            studentName: studentId,
            courseName: course.name,
            event: 'ENROLLED'
        });

        return enrollment;
    }

    async unenrollStudent(enrollmentId) {
        const enrollment = await EnrollmentRepo.deleteById(enrollmentId);
        if (!enrollment) throw new Error('ENROLLMENT_NOT_FOUND');

        const course = await CourseRepo.findRaw(enrollment.course);
        if (course) {
            const section = course.sections.id(enrollment.sectionId);
            if (section) {
                section.seatsAvailable += 1;
                await CourseRepo.save(course);
            }

            enrollmentEventBus.emit('enrollment.dropped', {
                studentName: enrollmentId,
                courseName: course.name,
                event: 'UNENROLLED'
            });
        }

        return enrollment;
    }
}

module.exports = new EnrollmentService();