const bcrypt = require('bcryptjs');
const StudentRepo = require('../repositories/student.repository');
const TeacherRepo = require('../repositories/teacher.repository');
const AdminRepo = require('../repositories/admin.repository');

class UserFactory {
    async createUser(role, data) {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        switch (role) {
            case 'student':
                return this._createStudent({ ...data, password: hashedPassword });
            case 'teacher':
                return this._createTeacher({ ...data, password: hashedPassword });
            case 'admin':
                return this._createAdmin({ ...data, password: hashedPassword });
            default:
                throw new Error('INVALID_ROLE');
        }
    }

    async _createStudent(data) {
        const exists = await StudentRepo.findByEmailOrRoll(data.email, data.rollNumber);
        if (exists) throw new Error('DUPLICATE_STUDENT');

        return StudentRepo.create({
            name: data.name,
            email: data.email,
            password: data.password,
            rollNumber: data.rollNumber,
            department: data.department,
            program: data.program,
            semester: data.semester,
            batch: data.batch || null,
            section: data.section || null,
            phone: data.phone || null,
            address: data.address || null,
            cnic: data.cnic || null,
            dob: data.dob || null,
            guardian: data.guardian || {}
        });
    }

    async _createTeacher(data) {
        const exists = await TeacherRepo.findByEmailOrEmployeeId(data.email, data.employeeId);
        if (exists) throw new Error('DUPLICATE_TEACHER');

        return TeacherRepo.create({
            name: data.name,
            email: data.email,
            password: data.password,
            employeeId: data.employeeId,
            department: data.department
        });
    }

    async _createAdmin(data) {
        return AdminRepo.create({
            name: data.name,
            email: data.email,
            password: data.password,
            adminId: data.adminId
        });
    }
}

module.exports = new UserFactory();