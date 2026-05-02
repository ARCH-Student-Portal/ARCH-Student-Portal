class AttendanceService {
    calcAttendancePercentage(attended, total) {
        return total > 0
            ? parseFloat(((attended / total) * 100).toFixed(1))
            : null;
    }

    isAtRisk(percentage) {
        return percentage !== null && percentage < 75;
    }
}

module.exports = new AttendanceService();