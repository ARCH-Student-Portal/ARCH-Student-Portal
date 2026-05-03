const Announcement = require('../models/Announcement');

class AnnouncementRepository {
    async findAll() {
        return Announcement.find()
            .populate('createdBy', 'name')
            .populate('course', 'courseCode name')
            .sort({ createdAt: -1 });
    }
    async findByCreator(creatorId) {
        return Announcement.find({ createdBy: creatorId })
            .populate('course', 'courseCode name')
            .sort({ createdAt: -1 });
    }
    async deleteById(id) {
        return Announcement.findByIdAndDelete(id);
    }

    async updateById(id, data) {
        return Announcement.findByIdAndUpdate(id, data, { new: true })
            .populate('createdBy', 'name')
            .populate('course', 'courseCode name');
    }

    // findForStudent must include university-wide (course: null) announcements
    async findForStudent(enrolledCourseIds, week) {
    const query = {
        $or: [
        { type: 'university' },                    // all students see these
        { course: { $in: enrolledCourseIds } },    // course-specific
        ]
    };
    if (week) query.weekNumber = Number(week);
    return Announcement.find(query)
        .populate('createdBy', 'name')
        .populate('course', 'courseCode name')
        .sort({ createdAt: -1 });
    }
    async create(data) {
        return Announcement.create(data);
    }
    async countByCreator(creatorId) {
        return Announcement.countDocuments({ createdBy: creatorId });
    }
}

module.exports = new AnnouncementRepository();