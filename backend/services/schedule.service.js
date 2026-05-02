const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const sortByDayAndTime = (slots) => {
    return slots.sort((a, b) => {
        const dayDiff = DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
        return dayDiff !== 0 ? dayDiff : a.startTime.localeCompare(b.startTime);
    });
};

module.exports = { sortByDayAndTime };