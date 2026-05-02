const Enrollment = require('../models/Enrollment');

class EnrollmentRepository {
    async findById(id) {
        return Enrollment.findById(id);
    }
    async findByStudent(studentId) {
        return Enrollment.find({ student: studentId });
    }
    async findActiveByStudent(studentId) {
        return Enrollment.find({ student: studentId, isCompleted: false });
    }
    async findActiveByStudentPopulated(studentId, courseFields) {
        return Enrollment.find({ student: studentId, isCompleted: false }).populate('course', courseFields);
    }
    async findCompletedByStudent(studentId) {
        return Enrollment.find({ student: studentId, isCompleted: true })
            .populate('course', 'courseCode name creditHours weightage');
    }
    async findByStudentPopulatedCourse(studentId) {
        return Enrollment.find({ student: studentId })
            .populate('course', 'courseCode name creditHours weightage');
    }
    async findActiveBySection(courseId, sectionId) {
        return Enrollment.find({ course: courseId, sectionId, isCompleted: false });
    }
    async findActiveBySectionPopulated(courseId, sectionId) {
        return Enrollment.find({ course: courseId, sectionId, isCompleted: false })
            .populate('student', 'name rollNumber email semester');
    }
    async findByCourseIds(courseIds) {
        return Enrollment.find({ course: { $in: courseIds }, isCompleted: false });
    }
    async findOne(query) {
        return Enrollment.findOne(query);
    }
    async create(data) {
        return Enrollment.create(data);
    }
    async deleteById(id) {
        return Enrollment.findByIdAndDelete(id);
    }
    async deleteByStudent(studentId) {
        return Enrollment.deleteMany({ student: studentId });
    }
    async deleteByCourse(courseId) {
        return Enrollment.deleteMany({ course: courseId });
    }
    async countBySection(courseId, sectionId) {
        return Enrollment.countDocuments({ course: courseId, sectionId, isCompleted: false });
    }
    async save(enrollment) {
        return enrollment.save();
    }
}

module.exports = new EnrollmentRepository();