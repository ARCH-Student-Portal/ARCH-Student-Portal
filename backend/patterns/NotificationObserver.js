// The Observer pattern defines a one-to-many dependency between objects.
// When one object (subject) changes state, all its dependents (observers)
// are notified automatically.
// Here the subject is the enrollment system — observers react to
// grade and attendance events.

class EventEmitter {
    constructor() {
        this.listeners = {};
    }

    on(event, listener) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(listener);
    }

    emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(listener => listener(data));
    }

    off(event, listener) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    }
}

// Observers
class AttendanceObserver {
    update({ studentName, courseName, percentage }) {
        if (percentage < 75) {
            console.log(`[ALERT] ${studentName} attendance in ${courseName} dropped to ${percentage}% — below 75% threshold`);
        }
    }
}

class GradeObserver {
    update({ studentName, courseName, letterGrade }) {
        if (letterGrade === 'F') {
            console.log(`[ALERT] ${studentName} has failed ${courseName} — grade: F`);
        }
    }
}

class EnrollmentObserver {
    update({ studentName, courseName, event }) {
        console.log(`[INFO] Enrollment event: ${event} — ${studentName} in ${courseName}`);
    }
}

// Subject — singleton event bus
const enrollmentEventBus = new EventEmitter();

// register observers
const attendanceObserver = new AttendanceObserver();
const gradeObserver = new GradeObserver();
const enrollmentObserver = new EnrollmentObserver();

enrollmentEventBus.on('attendance.updated', (data) => attendanceObserver.update(data));
enrollmentEventBus.on('grade.updated', (data) => gradeObserver.update(data));
enrollmentEventBus.on('enrollment.created', (data) => enrollmentObserver.update(data));
enrollmentEventBus.on('enrollment.dropped', (data) => enrollmentObserver.update(data));

module.exports = { enrollmentEventBus };