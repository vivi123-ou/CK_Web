import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';
import ProtectedRoute from '../components/ProtectedRoute';

import LoginPage from '../pages/login/LoginPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import GiaovuDashboard from '../pages/giaovu/GiaovuDashboard';
import GiangvienDashboard from '../pages/giangvien/GiangvienDashboard';
import SinhvienDashboard from '../pages/sinhvien/SinhvienDashboard';
import ChangePasswordPage from '../pages/ChangePasswordPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/giaovu/*" element={
              <ProtectedRoute allowedRoles={['GIAOVU']}>
                <GiaovuDashboard />
              </ProtectedRoute>
            } />

            <Route path="/giangvien/*" element={
              <ProtectedRoute allowedRoles={['GIANGVIEN']}>
                <GiangvienDashboard />
              </ProtectedRoute>
            } />

            <Route path="/sinhvien/*" element={
              <ProtectedRoute allowedRoles={['SINHVIEN']}>
                <SinhvienDashboard />
              </ProtectedRoute>
            } />

            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
