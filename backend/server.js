const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const studentAuthRoutes = require('./routes/auth.student.routes');
const teacherAuthRoutes = require('./routes/auth.teacher.routes');
const adminAuthRoutes = require('./routes/auth.admin.routes');
const studentRoutes = require('./routes/student.routes');
const teacherRoutes = require('./routes/teacher.routes');

const app = express();
app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});