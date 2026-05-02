import BASE_URL from './api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

const TeacherApi = {
    login: (identifier, password) =>
    fetch(`${BASE_URL}/auth/teacher/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
    }).then(r => r.json()),

    getProfile: () =>
        fetch(`${BASE_URL}/teacher/profile`, { headers: headers() }).then(r => r.json()),

    getDashboard: () =>
        fetch(`${BASE_URL}/teacher/dashboard`, { headers: headers() }).then(r => r.json()),

    getSections: () =>
        fetch(`${BASE_URL}/teacher/sections`, { headers: headers() }).then(r => r.json()),

    getSectionStudents: (sectionId) =>
        fetch(`${BASE_URL}/teacher/sections/${sectionId}/students`, { headers: headers() }).then(r => r.json()),

    getGradebook: (sectionId) =>
        fetch(`${BASE_URL}/teacher/sections/${sectionId}/gradebook`, { headers: headers() }).then(r => r.json()),

    updateGrades: (sectionId, data) =>
        fetch(`${BASE_URL}/teacher/sections/${sectionId}/grades`, {
            method: 'PATCH',
            headers: headers(),
            body: JSON.stringify(data)
        }).then(r => r.json()),

    getAttendance: (sectionId) =>
        fetch(`${BASE_URL}/teacher/sections/${sectionId}/attendance`, { headers: headers() }).then(r => r.json()),

    markAttendance: (sectionId, data) =>
        fetch(`${BASE_URL}/teacher/sections/${sectionId}/attendance`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(data)
        }).then(r => r.json()),

    getSchedule: () =>
        fetch(`${BASE_URL}/teacher/schedule`, { headers: headers() }).then(r => r.json()),

    getAnnouncements: () =>
        fetch(`${BASE_URL}/teacher/announcements`, { headers: headers() }).then(r => r.json()),

    postAnnouncement: (data) =>
        fetch(`${BASE_URL}/teacher/announcements`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(data)
        }).then(r => r.json()),
};

export default TeacherApi;