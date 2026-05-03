const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const db = require('./config/db');
db.connect();

const studentAuthRoutes = require('./routes/auth.student.routes');
const teacherAuthRoutes = require('./routes/auth.teacher.routes');
const adminAuthRoutes = require('./routes/auth.admin.routes');
const studentRoutes = require('./routes/student.routes');
const teacherRoutes = require('./routes/teacher.routes');
const adminRoutes = require('./routes/admin.routes');
const Student = require('./models/Student');
const PendingRegistration = require('./models/PendingRegistration');

const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));app.use(express.json());

app.get('/', (req, res) => {
    res.send('Arch Academic Portal API is running');
});

// Auth routes
app.use('/api/auth/student', studentAuthRoutes);
app.use('/api/auth/teacher', teacherAuthRoutes);
app.use('/api/auth/admin', adminAuthRoutes);

// Feature routes
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);

const dropLegacyEmailIndex = async (model) => {
    try {
        await model.collection.dropIndex('email_1');
        console.log(`Dropped legacy email_1 index on ${model.modelName}`);
    } catch (error) {
        if (error.codeName !== 'IndexNotFound' && error.code !== 27) {
            console.log(`Index check on ${model.modelName}: ${error.message}`);
        }
    }
};

const start = async () => {
    await db.connect();
    await dropLegacyEmailIndex(Student);
    await dropLegacyEmailIndex(PendingRegistration);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

start().catch((error) => {
    console.error(error);
    process.exit(1);
});