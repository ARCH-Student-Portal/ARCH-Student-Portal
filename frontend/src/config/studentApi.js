import BASE_URL from './api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

const StudentApi = {
    login: (identifier, password) =>
        fetch(`${BASE_URL}/auth/student/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        }).then(r => r.json()),

    getProfile: () =>
        fetch(`${BASE_URL}/student/profile`, { headers: headers() }).then(r => r.json()),

    getCourses: () =>
        fetch(`${BASE_URL}/student/courses`, { headers: headers() }).then(r => r.json()),

    getGrades: () =>
        fetch(`${BASE_URL}/student/grades`, { headers: headers() }).then(r => r.json()),

    getAttendance: () =>
        fetch(`${BASE_URL}/student/attendance`, { headers: headers() }).then(r => r.json()),

    getGPA: () =>
        fetch(`${BASE_URL}/student/gpa`, { headers: headers() }).then(r => r.json()),

    getTranscript: () =>
        fetch(`${BASE_URL}/student/transcript`, { headers: headers() }).then(r => r.json()),

    getTimetable: () =>
        fetch(`${BASE_URL}/student/timetable`, { headers: headers() }).then(r => r.json()),

    getAnnouncements: (week = null) =>
        fetch(`${BASE_URL}/student/announcements${week ? `?week=${week}` : ''}`, { headers: headers() }).then(r => r.json()),

    updateProfile: (data) =>
        fetch(`${BASE_URL}/student/profile`, {
            method: 'PATCH',
            headers: headers(),
            body: JSON.stringify(data)
        }).then(r => r.json()),

    // ── REGISTRATION ──────────────────────────────────────────────────────────
    getAvailableCourses: () =>
        fetch(`${BASE_URL}/student/available-courses`, { headers: headers() }).then(r => r.json()),

    enrollCourse: (courseId, sectionId, semester) =>
        fetch(`${BASE_URL}/student/enroll`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ courseId, sectionId, semester })
        }).then(r => r.json()),

    dropCourse: (enrollmentId) =>
        fetch(`${BASE_URL}/student/enroll/${enrollmentId}`, {
            method: 'DELETE',
            headers: headers(),
        }).then(r => r.json()),
};

export default StudentApi;