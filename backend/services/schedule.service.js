class ScheduleService {
    constructor() {
        this.DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    }

    sortByDayAndTime(slots) {
        return slots.sort((a, b) => {
            const dayDiff = this.DAY_ORDER.indexOf(a.day) - this.DAY_ORDER.indexOf(b.day);
            return dayDiff !== 0 ? dayDiff : a.startTime.localeCompare(b.startTime);
        });
    }
}

module.exports = new ScheduleService();