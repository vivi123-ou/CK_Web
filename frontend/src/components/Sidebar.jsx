import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, BarChart2, FileText, Building2,
  Star, PenLine, BookOpen, GraduationCap, Target, Key, LogOut
} from 'lucide-react';

const MENUS = {
  ADMIN: [
    { icon: LayoutDashboard, label: 'Tổng quan',        path: '/admin',            exact: true },
    { icon: Users,           label: 'Người dùng',       path: '/admin/users' },
    { icon: BarChart2,       label: 'Thống kê',         path: '/admin/statistics' },
  ],
  GIAOVU: [
    { icon: LayoutDashboard, label: 'Tổng quan',        path: '/giaovu',           exact: true },
    { icon: FileText,        label: 'Khoá luận',        path: '/giaovu/thesis' },
    { icon: Building2,       label: 'Hội đồng',         path: '/giaovu/councils' },
    { icon: Star,            label: 'Tiêu chí',         path: '/giaovu/criteria' },
    { icon: BarChart2,       label: 'Thống kê',         path: '/giaovu/statistics' },
  ],
  GIANGVIEN: [
    { icon: LayoutDashboard, label: 'Tổng quan',        path: '/giangvien',        exact: true },
    { icon: PenLine,         label: 'Chấm điểm',        path: '/giangvien/grading' },
    { icon: BookOpen,        label: 'KL Hướng dẫn',     path: '/giangvien/advisor' },
  ],
  SINHVIEN: [
    { icon: LayoutDashboard, label: 'Tổng quan',        path: '/sinhvien',         exact: true },
    { icon: GraduationCap,   label: 'Khoá luận',        path: '/sinhvien/thesis' },
    { icon: Target,          label: 'Điểm số',          path: '/sinhvien/scores' },
  ],
};

const ROLE_LABELS = {
  ADMIN:     'Quản trị viên',
  GIAOVU:    'Giáo vụ khoa',
  GIANGVIEN: 'Giảng viên',
  SINHVIEN:  'Sinh viên',
};

const ROLE_COLOR = {
  ADMIN:     '#EF4444',
  GIAOVU:    '#8B5CF6',
  GIANGVIEN: '#0072CC',
  SINHVIEN:  '#10B981',
};

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoErr, setLogoErr] = useState(false);

  if (!user) return null;

  const menus = MENUS[user.role] || [];

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        {!logoErr ? (
          <img
            src="/logo-ou-white.png"
            alt="Logo OU"
            style={{ height: 36, objectFit: 'contain', flexShrink: 0 }}
            onError={() => setLogoErr(true)}
          />
        ) : (
          <div className="logo-badge">OU</div>
        )}
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>ĐH Mở TP.HCM</div>
          <div className="logo-role-tag">{ROLE_LABELS[user.role]}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '14px 12px', flex: 1 }}>
        <div className="sidebar-section-label">Điều hướng</div>
        {menus.map((m) => {
          const Icon = m.icon;
          const active = isActive(m);
          return (
            <div
              key={m.path}
              className={`menu-item ${active ? 'active' : ''}`}
              onClick={() => navigate(m.path)}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              <span>{m.label}</span>
            </div>
          );
        })}

        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '14px 0' }} />
        <div className="sidebar-section-label">Tài khoản</div>

        <div className="menu-item" onClick={() => navigate('/change-password')}>
          <Key size={16} strokeWidth={2} />
          <span>Đổi mật khẩu</span>
        </div>

        <div className="menu-item" onClick={handleLogout}
          style={{ color: 'rgba(239,68,68,0.7)', marginTop: 4 }}
          onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,0.7)'}
        >
          <LogOut size={16} strokeWidth={2} />
          <span>Đăng xuất</span>
        </div>
      </nav>

      {/* User info */}
      <div className="sidebar-user">
        {user.avatar ? (
          <img src={user.avatar} alt="avatar" className="sidebar-avatar" />
        ) : (
          <div className="sidebar-avatar-placeholder" style={{ background: ROLE_COLOR[user.role] }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <div style={{ overflow: 'hidden' }}>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.name}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.email}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
