import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// ── SHARED ──
import LoginPage from "./LoginPage";
import { CourseProvider } from "./CourseContext";

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

// ── ENTERPRISE PAGE TRANSITION WRAPPER ──
const Page = ({ children }) => (
  <motion.div
    initial={{ x: 50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -50, opacity: 0 }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
    style={{ height: "100vh", width: "100vw", overflow: "hidden" }}
  >
    {children}
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ── DEFAULT ── */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ── STUDENT ROUTES ── */}
        <Route path="/student/dashboard"    element={<Page><StudentDashV1 /></Page>} />
        <Route path="/student/academic"     element={<Page><StudentAcademicV1 /></Page>} />
        <Route path="/student/registration" element={<Page><StudentRegistrationV1 /></Page>} />
        <Route path="/student/attendance"   element={<Page><StudentAttendance /></Page>} />
        <Route path="/student/profile"      element={<Page><StudentProfile /></Page>} />
        <Route path="/student/notices"      element={<Page><StudentNotices /></Page>} />
        <Route path="/student/timetable"    element={<Page><StudentTimetableV1 /></Page>} />
        <Route path="/student/marks"        element={<Page><StudentMarks /></Page>} />
        <Route path="/student/transcript"   element={<Page><StudentTranscript /></Page>} />

        {/* ── TEACHER ROUTES ── */}
        <Route path="/teacher/dashboard"  element={<Page><TeacherDashV1 /></Page>} />
        <Route path="/teacher/sections"   element={<Page><TeacherSectionsV1 /></Page>} />
        <Route path="/teacher/gradebook"  element={<Page><TeacherGradebook /></Page>} />
        <Route path="/teacher/attendance" element={<Page><TeacherAttendance /></Page>} />
        <Route path="/teacher/schedule"   element={<Page><TeacherSchedule /></Page>} />
        <Route path="/teacher/alerts"     element={<Page><TeacherBroadcasts /></Page>} /> 
        <Route path="/teacher/profile"    element={<Page><TeacherProfile /></Page>} /> 

        {/* ── ADMIN ROUTES ── */}
        <Route path="/admin/dashboard"      element={<Page><AdminDashboard /></Page>} />
        <Route path="/admin/students"       element={<Page><AdminStudents /></Page>} />
        <Route path="/admin/courses"        element={<Page><AdminCourses /></Page>} />
        <Route path="/admin/teachers"       element={<Page><AdminTeachers /></Page>} />
        <Route path="/admin/enrollment"     element={<Page><AdminEnrollment /></Page>} />
        <Route path="/admin/announcements"  element={<Page><AdminAnnouncements /></Page>} />
        
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CourseProvider>
        <AnimatedRoutes />
      </CourseProvider>
    </BrowserRouter>
  );
}