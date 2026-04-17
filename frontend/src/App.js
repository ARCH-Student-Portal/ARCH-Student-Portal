import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import LoginPage from "./LoginPage";
import StudentDashV1 from "./StudentDashV1";
import StudentAcademicV1 from "./StudentAcademicV1";
import StudentAttendance from "./StudentAttendance";
import StudentRegistrationV1 from "./StudentRegistrationV1";
import StudentProfile from "./StudentProfile"

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/student/dashboard" element={
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }} style={{ height: '100vh', width: '100vw' }}>
            <StudentDashV1 />
          </motion.div>
        } />

        <Route path="/student/academic" element={
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }} style={{ height: '100vh', width: '100vw' }}>
            <StudentAcademicV1 />
          </motion.div>
        } />

        <Route path="/student/registration" element={
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }} style={{ height: '100vh', width: '100vw' }}>
            <StudentRegistrationV1 />
          </motion.div>
        } />

        <Route path="/student/attendance" element={
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }} style={{ height: '100vh', width: '100vw' }}>
            <StudentAttendance />
          </motion.div>
        } />

        <Route path="/student/profile" element={
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }} style={{ height: '100vh', width: '100vw' }}>
            <StudentProfile />
          </motion.div>
        } />

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