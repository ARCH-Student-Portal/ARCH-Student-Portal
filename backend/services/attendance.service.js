const calcAttendancePercentage = (attended, total) => {
    return total > 0
        ? parseFloat(((attended / total) * 100).toFixed(1))
        : null;
};

const isAtRisk = (percentage) => percentage !== null && percentage < 75;

module.exports = { calcAttendancePercentage, isAtRisk };