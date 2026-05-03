# ARCH Student Portal

A full-stack academic management system for educational institutions. Provides role-based dashboards and tools for **Students**, **Teachers**, and **Admins** — covering everything from course registration and gradebooks to attendance tracking and announcements.

---

## Features

### Students
- Dashboard with GPA, credit hours, and attendance stats
- View enrolled courses, teacher info, and schedules
- Course registration and withdrawal
- Grades, academic transcript, and GPA calculation
- Attendance records
- Announcements and notices feed
- Timetable view and profile management

### Teachers
- Dashboard with section and student stats
- View assigned sections and student lists
- Gradebook management (enter and update grades)
- Attendance marking per student per session
- Class schedule view
- Create course-specific announcements

### Admins
- System-wide dashboard with aggregate stats
- Full CRUD for students, teachers, and courses
- Enrollment management (create, complete, drop, reactivate)
- University-wide and faculty announcements management

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router DOM 7, Zustand, Axios |
| Animations | Framer Motion, GSAP, Three.js |
| Charts | Recharts |
| Forms | React Hook Form |
| Notifications | React Hot Toast |
| Backend | Node.js, Express 5 |
| Database | MongoDB 9, Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs |

---

## Project Structure

```
ARCH-Student-Portal/
├── frontend/                   # React app (port 3000)
│   └── src/
│       ├── App.js              # Route configuration
│       ├── LoginPage.jsx       # Animated login (Three.js + GSAP)
│       ├── Components/
│       │   ├── shared/         # PageShell, Sidebar, AdminSidebar
│       │   ├── Student/        # Grade charts, distributions
│       │   └── Admin/          # Compose modal, announcement cards
│       ├── config/             # Axios API configs per role
│       ├── Utilities/          # WebGL background, animations, helpers
│       └── [Pages]/            # All page components by role
│
└── backend/                    # Express API (port 5000)
    ├── server.js               # Entry point
    ├── seed.js                 # Database seeder
    ├── config/db.js            # MongoDB connection (Singleton)
    ├── models/                 # Mongoose schemas
    ├── routes/                 # Route definitions
    ├── controllers/            # Request handlers
    ├── middleware/             # JWT auth middleware
    ├── repositories/           # Data access layer
    ├── services/               # Business logic (grades, attendance, etc.)
    └── patterns/               # Design pattern implementations
```

---

## Getting Started

### Prerequisites
- Node.js v14+
- MongoDB running locally on port 27017

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/Arch_DataBase
JWT_SECRET=arch_super_secret_key
JWT_EXPIRES_IN=7d
```

Seed the database, then start the server:

```bash
node seed.js
node server.js
```

The API runs at `http://localhost:5000`.

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm start
```

The app runs at `http://localhost:3000`.

---

## Default Test Credentials

| Role | Identifier | Password |
|------|-----------|----------|
| Admin | `ADM-0001` | `test1234` |
| Teacher | `T-001` | `test1234` |
| Student | `21L-3211` | `test1234` |

---

## API Overview

All protected routes require `Authorization: Bearer <token>` in the request header.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/student/login` | Student login |
| POST | `/api/auth/teacher/login` | Teacher login |
| POST | `/api/auth/admin/login` | Admin login |

### Student Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/profile` | Get profile |
| PATCH | `/api/student/profile` | Update profile |
| GET | `/api/student/courses` | Enrolled courses |
| GET | `/api/student/grades` | Course grades |
| GET | `/api/student/gpa` | GPA calculation |
| GET | `/api/student/attendance` | Attendance records |
| GET | `/api/student/transcript` | Academic transcript |
| GET | `/api/student/timetable` | Class schedule |
| GET | `/api/student/announcements` | Notices (supports `?week=N`) |
| GET | `/api/student/available-courses` | Courses available for registration |
| POST | `/api/student/enroll` | Enroll in a course |
| DELETE | `/api/student/enroll/:enrollmentId` | Drop a course |

### Teacher Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teacher/profile` | Get profile |
| GET | `/api/teacher/dashboard` | Dashboard stats |
| GET | `/api/teacher/sections` | Assigned sections |
| GET | `/api/teacher/sections/:sectionId/students` | Students in section |
| GET | `/api/teacher/sections/:sectionId/gradebook` | Gradebook |
| PATCH | `/api/teacher/sections/:sectionId/grades` | Update grades |
| GET | `/api/teacher/sections/:sectionId/attendance` | Attendance records |
| POST | `/api/teacher/sections/:sectionId/attendance` | Mark attendance |
| GET | `/api/teacher/schedule` | Teaching schedule |
| GET | `/api/teacher/announcements` | View announcements |
| POST | `/api/teacher/announcements` | Create announcement |

### Admin Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | System stats |
| GET/POST | `/api/admin/students` | List / create students |
| GET/PATCH/DELETE | `/api/admin/students/:id` | Read / update / delete student |
| GET/POST | `/api/admin/teachers` | List / create teachers |
| GET/PATCH/DELETE | `/api/admin/teachers/:id` | Read / update / delete teacher |
| GET/POST | `/api/admin/courses` | List / create courses |
| GET/PATCH/DELETE | `/api/admin/courses/:id` | Read / update / delete course |
| POST | `/api/admin/enrollments` | Enroll student in course |
| DELETE | `/api/admin/enrollments/:id` | Remove enrollment |
| PATCH | `/api/admin/enrollments/:id/complete` | Mark complete |
| PATCH | `/api/admin/enrollments/:id/drop` | Drop enrollment |
| PATCH | `/api/admin/enrollments/:id/reactivate` | Reactivate enrollment |
| GET/POST | `/api/admin/announcements` | List / create announcements |
| PATCH/DELETE | `/api/admin/announcements/:id` | Update / delete announcement |

---

## Architecture

The backend follows a layered architecture:

```
Routes → Controllers → Services → Repositories → Models
```

**Design patterns used:**

| Pattern | Where |
|---------|-------|
| Template Method | `AuthTemplate` — base auth flow for all three roles |
| Factory | `UserFactory` — user object creation |
| Repository | All data access abstracted per entity |
| Adapter | `AnnouncementAdapter` — flexible announcement handling |
| Observer | `NotificationObserver` — notification hooks |
| Iterator | `PaginationIterator` — paginated list results |
| State | `EnrollmentState` — enrollment lifecycle management |
| Singleton | `DBConnection` — single MongoDB connection instance |

---

## Database Models

- **Student** — profile, roll number, department, semester, guardian info
- **Teacher** — profile, employee ID, department
- **Admin** — profile, admin ID
- **Course** — course code, credit hours, sections with schedules, assessment weightages, prerequisites
- **Enrollment** — links student ↔ course; stores assessments, attendance log, letter grade
- **Announcement** — title, body, type (`university` | `faculty`), optional course link, week number

---

## License

See [LICENSE](LICENSE).
