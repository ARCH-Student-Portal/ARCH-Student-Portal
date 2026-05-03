import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// ── SHARED ──
import LoginPage from "./LoginPage";

import PageShell from "./Components/shared/PageShell";

// ── STUDENT ──
import StudentDashV1 from "./StudentDashV1";
import StudentAcademicV1 from "./StudentAcademicV1";
import StudentAttendance from "./StudentAttendance";
import StudentRegistrationV1 from "./StudentRegistrationV1";
import StudentProfile from "./StudentProfile";
import StudentNotices from "./StudentNotices";
import StudentTimetableV1 from "./StudentTimetableV1";
import StudentMarks from "./StudentMarks";
import StudentTranscript from "./StudentTranscript";

// ── TEACHER ──
import TeacherDashV1 from "./TeacherDashV1"; 
import TeacherSectionsV1 from "./TeacherSectionsV1";
import TeacherGradebook from "./TeacherGradebook";
import TeacherAttendance from "./TeacherAttendance";
import TeacherSchedule from "./TeacherSchedule";
import TeacherBroadcasts from "./TeacherBroadcasts"; 
import TeacherProfile from "./TeacherProfile"; 

// ── ADMIN ──
import AdminDashboard from "./AdminDashboard";
import AdminStudents from "./AdminStudents";
import AdminCourses from "./AdminCourses";
import AdminTeachers from "./AdminTeachers";
import AdminEnrollment from "./AdminEnrollment";
import AdminAnnouncements from "./AdminAnnouncements";

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ── DEFAULT ── */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ── STUDENT ROUTES ── */}
        <Route path="/student/dashboard"    element={<PageShell><StudentDashV1 /></PageShell>} />
        <Route path="/student/academic"     element={<PageShell><StudentAcademicV1 /></PageShell>} />
        <Route path="/student/registration" element={<PageShell><StudentRegistrationV1 /></PageShell>} />
        <Route path="/student/attendance"   element={<PageShell><StudentAttendance /></PageShell>} />
        <Route path="/student/profile"      element={<PageShell><StudentProfile /></PageShell>} />
        <Route path="/student/notices"      element={<PageShell><StudentNotices /></PageShell>} />
        <Route path="/student/timetable"    element={<PageShell><StudentTimetableV1 /></PageShell>} />
        <Route path="/student/marks"        element={<PageShell><StudentMarks /></PageShell>} />
        <Route path="/student/transcript"   element={<PageShell><StudentTranscript /></PageShell>} />

        {/* ── TEACHER ROUTES ── */}
        <Route path="/teacher/dashboard"  element={<PageShell><TeacherDashV1 /></PageShell>} />
        <Route path="/teacher/sections"   element={<PageShell><TeacherSectionsV1 /></PageShell>} />
        <Route path="/teacher/gradebook"  element={<PageShell><TeacherGradebook /></PageShell>} />
        <Route path="/teacher/attendance" element={<PageShell><TeacherAttendance /></PageShell>} />
        <Route path="/teacher/schedule"   element={<PageShell><TeacherSchedule /></PageShell>} />
        <Route path="/teacher/alerts"     element={<PageShell><TeacherBroadcasts /></PageShell>} /> 
        <Route path="/teacher/profile"    element={<PageShell><TeacherProfile /></PageShell>} /> 

        {/* ── ADMIN ROUTES ── */}
        <Route path="/admin/dashboard"      element={<PageShell><AdminDashboard /></PageShell>} />
        <Route path="/admin/students"       element={<PageShell><AdminStudents /></PageShell>} />
        <Route path="/admin/courses"        element={<PageShell><AdminCourses /></PageShell>} />
        <Route path="/admin/teachers"       element={<PageShell><AdminTeachers /></PageShell>} />
        <Route path="/admin/enrollment"     element={<PageShell><AdminEnrollment /></PageShell>} />
        <Route path="/admin/announcements"  element={<PageShell><AdminAnnouncements /></PageShell>} />
        
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
        <AnimatedRoutes />
    </BrowserRouter>
  );
}