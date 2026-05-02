// The Adapter pattern wraps an existing interface and converts it
// into a format that the client expects.
// Here we normalize raw Mongoose announcement documents
// into a consistent format the frontend always expects,
// regardless of whether the announcement is university or faculty type.

class AnnouncementAdapter {
    adapt(announcement) {
        return {
            id: announcement._id,
            title: announcement.title,
            body: announcement.body,
            type: announcement.type,
            category: announcement.category,
            weekNumber: announcement.weekNumber,
            createdAt: announcement.createdAt,
            createdBy: announcement.createdBy?.name ?? 'Unknown',
            createdByModel: announcement.createdByModel,
            course: announcement.course
                ? {
                    id: announcement.course._id,
                    code: announcement.course.courseCode,
                    name: announcement.course.name
                }
                : null,
            isPinned: announcement.category === 'mid' || announcement.category === 'final',
            tag: this._resolveTag(announcement)
        };
    }

    adaptMany(announcements) {
        return announcements.map(a => this.adapt(a));
    }

    _resolveTag(announcement) {
        if (announcement.category === 'mid') return 'MID EXAM';
        if (announcement.category === 'final') return 'FINAL EXAM';
        if (announcement.category === 'activity') return 'ACTIVITY';
        if (announcement.type === 'university') return 'UNIVERSITY';
        if (announcement.type === 'faculty') return 'FACULTY';
        return 'NOTICE';
    }
}

module.exports = new AnnouncementAdapter();