import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ROLE_HOME = {
  ADMIN: '/admin',
  GIAOVU: '/giaovu',
  GIANGVIEN: '/giangvien',
  SINHVIEN: '/sinhvien',
};

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#005BAA' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #E2EEFB', borderTopColor: '#0072CC', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 600 }}>Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
  }

  return children;
}

export default ProtectedRoute;
