const Course = require('../models/Course');

class CourseRepository {
    async findById(id) {
        return Course.findById(id)
            .populate('sections.teacher', 'name email employeeId')
            .populate('prerequisites', 'courseCode name');
    }
    async findAll() {
        return Course.find()
            .populate('sections.teacher', 'name email employeeId')
            .populate('prerequisites', 'courseCode name');
    }
    async findByCode(courseCode) {
        return Course.findOne({ courseCode });
    }
    async findByTeacher(teacherId) {
        return Course.find({ 'sections.teacher': teacherId });
    }
    async findRaw(id) {
        return Course.findById(id);
    }
    async findOneBySection(sectionId, teacherId) {
        return Course.findOne({
            'sections._id': sectionId,
            'sections.teacher': teacherId
        });
    }
    async create(data) {
        return Course.create(data);
    }
    async updateById(id, updates) {
        return Course.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true })
            .populate('sections.teacher', 'name email')
            .populate('prerequisites', 'courseCode name');
    }
    async deleteById(id) {
        return Course.findByIdAndDelete(id);
    }
    async countAll() {
        return Course.countDocuments();
    }
    async save(course) {
        return course.save();
    }
}

module.exports = new CourseRepository();