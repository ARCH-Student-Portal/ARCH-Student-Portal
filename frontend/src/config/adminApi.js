import BASE_URL from './api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

const AdminApi = {
    login: (identifier, password) =>
    fetch(`${BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
    }).then(r => r.json()),

    getDashboard: () =>
        fetch(`${BASE_URL}/admin/dashboard`, { headers: headers() }).then(r => r.json()),

    // students
    getStudents: (page = 1, pageSize = 10) =>
        fetch(`${BASE_URL}/admin/students?page=${page}&pageSize=${pageSize}`, { headers: headers() }).then(r => r.json()),

    getStudent: (id) =>
        fetch(`${BASE_URL}/admin/students/${id}`, { headers: headers() }).then(r => r.json()),

    createStudent: (data) =>
        fetch(`${BASE_URL}/admin/students`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(data)
        }).then(r => r.json()),

    updateStudent: (id, data) =>
        fetch(`${BASE_URL}/admin/students/${id}`, {
            method: 'PATCH',
            headers: headers(),
            body: JSON.stringify(data)
        }).then(r => r.json()),

    deleteStudent: (id) =>
        fetch(`${BASE_URL}/admin/students/${id}`, {
            method: 'DELETE',
            headers: headers()
        }).then(r => r.json()),

    // teachers
    getTeachers: () =>
        fetch(`${BASE_URL}/admin/teachers`, { headers: headers() }).then(r => r.json()),

    getTeacher: (id) =>
        fetch(`${BASE_URL}/admin/teachers/${id}`, { headers: headers() }).then(r => r.json()),

    createTeacher: (data) =>
        fetch(`${BASE_URL}/admin/teachers`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(data)
        }).then(r => r.json()),

    updateTeacher: (id, data) =>
        fetch(`${BASE_URL}/admin/teachers/${id}`, {
            method: 'PATCH',
            headers: headers(),
            body: JSON.stringify(data)
        }).then(r => r.json()),

    deleteTeacher: (id) =>
        fetch(`${BASE_URL}/admin/teachers/${id}`, {
            method: 'DELETE',
            headers: headers()
        }).then(r => r.json()),

    // courses
    getCourses: (page = 1, pageSize = 10) =>
        fetch(`${BASE_URL}/admin/courses?page=${page}&pageSize=${pageSize}`, { headers: headers() }).then(r => r.json()),

    getCourse: (id) =>
        fetch(`${BASE_URL}/admin/courses/${id}`, { headers: headers() }).then(r => r.json()),

    createCourse: (data) =>
        fetch(`${BASE_URL}/admin/courses`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(data)
        }).then(r => r.json()),

    updateCourse: (id, data) =>
        fetch(`${BASE_URL}/admin/courses/${id}`, {
            method: 'PATCH',
            headers: headers(),
            body: JSON.stringify(data)
        }).then(r => r.json()),

    deleteCourse: (id) =>
        fetch(`${BASE_URL}/admin/courses/${id}`, {
            method: 'DELETE',
            headers: headers()
        }).then(r => r.json()),

    // enrollments
    enrollStudent: (data) =>
        fetch(`${BASE_URL}/admin/enrollments`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(data)
        }).then(r => r.json()),

    unenrollStudent: (id) =>
        fetch(`${BASE_URL}/admin/enrollments/${id}`, {
            method: 'DELETE',
            headers: headers()
        }).then(r => r.json()),

    completeEnrollment: (id, data) =>
        fetch(`${BASE_URL}/admin/enrollments/${id}/complete`, {
            method: 'PATCH',
            headers: headers(),
            body: JSON.stringify(data)
        }).then(r => r.json()),

    dropEnrollment: (id) =>
        fetch(`${BASE_URL}/admin/enrollments/${id}/drop`, {
            method: 'PATCH',
            headers: headers()
        }).then(r => r.json()),

    // announcements
    getAnnouncements: () =>
        fetch(`${BASE_URL}/admin/announcements`, { headers: headers() }).then(r => r.json()),

    postAnnouncement: (data) =>
        fetch(`${BASE_URL}/admin/announcements`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(data)
        }).then(r => r.json()),
};

export default AdminApi;