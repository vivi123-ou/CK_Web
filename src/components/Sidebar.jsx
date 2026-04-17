import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MENUS = {
  ADMIN: [
    { icon: '📊', label: 'Tổng quan', path: '/admin' },
    { icon: '👥', label: 'Quản lý người dùng', path: '/admin/users' },
    { icon: '📈', label: 'Thống kê', path: '/admin/statistics' },
  ],
  GIAOVU: [
    { icon: '📊', label: 'Tổng quan', path: '/giaovu' },
    { icon: '📝', label: 'Khoá luận', path: '/giaovu/thesis' },
    { icon: '🏛️', label: 'Hội đồng', path: '/giaovu/councils' },
    { icon: '⭐', label: 'Tiêu chí', path: '/giaovu/criteria' },
    { icon: '📈', label: 'Thống kê', path: '/giaovu/statistics' },
  ],
  GIANGVIEN: [
    { icon: '📊', label: 'Tổng quan', path: '/giangvien' },
    { icon: '✏️', label: 'Chấm điểm', path: '/giangvien/grading' },
    { icon: '📚', label: 'KL hướng dẫn', path: '/giangvien/advisor' },
  ],
  SINHVIEN: [
    { icon: '📊', label: 'Tổng quan', path: '/sinhvien' },
    { icon: '📖', label: 'Khoá luận của tôi', path: '/sinhvien/thesis' },
    { icon: '🎯', label: 'Điểm số', path: '/sinhvien/scores' },
  ],
};

const ROLE_LABELS = {
  ADMIN: 'Quản trị viên',
  GIAOVU: 'Giáo vụ khoa',
  GIANGVIEN: 'Giảng viên',
  SINHVIEN: 'Sinh viên',
};

function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const menus = MENUS[user.role] || [];

  const isActive = (path) => {
    if (path === `/${user.role.toLowerCase()}`) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-badge">OU</div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>ĐH Mở TP.HCM</div>
          <div className="logo-role-tag">{ROLE_LABELS[user.role]}</div>
        </div>
      </div>

      <div style={{ padding: '16px 12px', flex: 1 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, padding: '0 4px' }}>
          Điều hướng
        </div>
        {menus.map((m) => (
          <div
            key={m.path}
            className={`menu-item ${isActive(m.path) ? 'active' : ''}`}
            onClick={() => navigate(m.path)}
          >
            <span style={{ fontSize: 16 }}>{m.icon}</span>
            <span>{m.label}</span>
          </div>
        ))}

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '16px 0' }} />

        <div
          className="menu-item"
          onClick={() => navigate('/change-password')}
        >
          <span style={{ fontSize: 16 }}>🔑</span>
          <span>Đổi mật khẩu</span>
        </div>
      </div>

      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user.avatar ? (
            <img src={user.avatar} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{user.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{user.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
