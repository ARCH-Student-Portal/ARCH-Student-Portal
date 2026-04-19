import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import LoginPage from "./LoginPage";
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

const wrap = (Child) => (
  <motion.div
    initial={{ x: 50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -50, opacity: 0 }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
    style={{ height: "100vh", width: "100vw" }}
  >
    <Child />
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"                     element={<Navigate to="/login" replace />} />
        <Route path="/login"                element={<LoginPage />} />
        <Route path="/student/dashboard"    element={wrap(StudentDashV1)} />
        <Route path="/student/academic"     element={wrap(StudentAcademicV1)} />
        <Route path="/student/registration" element={wrap(StudentRegistrationV1)} />
        <Route path="/student/attendance"   element={wrap(StudentAttendance)} />
        <Route path="/student/profile"      element={wrap(StudentProfile)} />
        <Route path="/student/notices"      element={wrap(StudentNotices)} />
        <Route path="/student/timetable"    element={wrap(StudentTimetableV1)} />
        <Route path="/student/marks"        element={wrap(StudentMarks)} />
        <Route path="/student/transcript"   element={wrap(StudentTranscript)} />
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