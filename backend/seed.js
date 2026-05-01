const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Admin = require('./models/Admin');

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Clear existing data
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Admin.deleteMany({});

    const hashedPassword = await bcrypt.hash('test1234', 10);

    await Student.create({
        name: 'Areeb Khan',
        email: 'areeb@student.com',
        password: hashedPassword,
        rollNumber: 'F21-001',
        department: 'CS',
        program: 'BSCS',
        semester: 6,
        role: 'student'
    });

    await Teacher.create({
        name: 'Dr. Ahmad',
        email: 'ahmad@teacher.com',
        password: hashedPassword,
        employeeId: 'T-001',
        department: 'CS',
        role: 'teacher'
    });

    await Admin.create({
        name: 'Admin User',
        email: 'admin@arch.com',
        password: hashedPassword,
        role: 'admin'
    });

    console.log('Seeded: 1 student, 1 teacher, 1 admin');
    console.log('Password for all: test1234');
    process.exit(0);
};

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});