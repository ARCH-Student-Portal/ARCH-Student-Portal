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
    async findForStudent(courseIds, weekNumber) {
        const filter = {
            $or: [
                { type: 'university' },
                { type: 'faculty', course: { $in: courseIds } }
            ]
        };
        if (weekNumber) filter.weekNumber = parseInt(weekNumber);
        return Announcement.find(filter)
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