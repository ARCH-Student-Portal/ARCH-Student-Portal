import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// ── SHARED ──
import LoginPage from "./LoginPage";

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
import { CourseProvider } from "./CourseContext";

// ── TEACHER ──
import TeacherDashboardV1 from "./TeacherDashboardV1";
import TeacherSectionsV1 from "./TeacherSectionsV1";

// Reusable page transition wrapper
const Page = ({ children }) => (
  <motion.div
    initial={{ x: 50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -50, opacity: 0 }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
    style={{ height: "100vh", width: "100vw" }}
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
        <Route path="/student/dashboard" element={<Page><StudentDashV1 /></Page>} />
        <Route path="/student/academic" element={<Page><StudentAcademicV1 /></Page>} />
        <Route path="/student/registration" element={<Page><StudentRegistrationV1 /></Page>} />
        <Route path="/student/attendance" element={<Page><StudentAttendance /></Page>} />
        <Route path="/student/profile" element={<Page><StudentProfile /></Page>} />
        <Route path="/student/notices" element={<Page><StudentNotices /></Page>} />
        <Route path="/student/timetable" element={<Page><StudentTimetableV1 /></Page>} />
        <Route path="/student/marks" element={<Page><StudentMarks /></Page>} />
        <Route path="/student/transcript" element={<Page><StudentTranscript /></Page>} />

        {/* ── TEACHER ROUTES ── */}
        <Route path="/teacher/dashboard" element={<Page><TeacherDashboardV1 /></Page>} />
        <Route path="/teacher/sections" element={<Page><TeacherSectionsV1 /></Page>} />

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