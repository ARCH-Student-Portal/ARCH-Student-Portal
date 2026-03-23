import { Route, Routes, Navigate } from 'react-router-dom';
import StudentDashV1 from './StudentDashV1';
import LoginPage from './LoginPage';
function App() {
  return ( <Routes>
      <Route path="/" element={<LoginPage/>} />
      <Route path="/dashboard" element={<StudentDashV1/>} />
      <Route path="*" element={<Navigate to="/" replace/>} />
    </Routes>
  );
}
export default App;