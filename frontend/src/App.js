import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import StudentDashV1 from "./StudentDashV1";
import StudentAcademicV1 from "./StudentAcademicV1";
import StudentRegistrationV1 from "./StudentRegistrationV1"; // <-- ADDED: Import the new page

// We create a wrapper component so we can use the useLocation hook
function AnimatedRoutes() {
  const location = useLocation();

  return (
    // AnimatePresence listens for route changes to trigger exit/enter animations
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
        
        {/* Dashboard Page */}
        <Route path="/student/dashboard" element={
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }} style={{ height: '100vh', width: '100vw' }}>
            <StudentDashV1 />
          </motion.div>
        } />
        
        {/* Academic Page */}
        <Route path="/student/academic" element={
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }} style={{ height: '100vh', width: '100vw' }}>
            <StudentAcademicV1 />
          </motion.div>
        } />

        {/* Registration Page (ADDED) */}
        <Route path="/student/registration" element={
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }} style={{ height: '100vh', width: '100vw' }}>
            <StudentRegistrationV1 />
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