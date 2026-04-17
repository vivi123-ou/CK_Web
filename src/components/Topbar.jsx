import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PAGE_TITLES = {
  '/admin': 'Tổng quan hệ thống',
  '/admin/users': 'Quản lý người dùng',
  '/admin/statistics': 'Thống kê & Báo cáo',
  '/giaovu': 'Tổng quan Giáo vụ',
  '/giaovu/thesis': 'Quản lý Khoá luận',
  '/giaovu/councils': 'Quản lý Hội đồng',
  '/giaovu/criteria': 'Tiêu chí chấm điểm',
  '/giaovu/statistics': 'Thống kê & Báo cáo',
  '/giangvien': 'Tổng quan Giảng viên',
  '/giangvien/grading': 'Chấm điểm Khoá luận',
  '/giangvien/advisor': 'Khoá luận Hướng dẫn',
  '/sinhvien': 'Tổng quan',
  '/sinhvien/thesis': 'Khoá luận của tôi',
  '/sinhvien/scores': 'Điểm số',
  '/change-password': 'Đổi mật khẩu',
};

function Topbar({ pageTitle, breadcrumb }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const title = pageTitle || PAGE_TITLES[window.location.pathname] || 'Hệ thống';

  return (
    <div className="topbar">
      <div>
        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{title}</div>
        {breadcrumb && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{breadcrumb}</div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="avatar"
              style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
            />
          ) : (
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--ou-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{user?.name}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role}</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/change-password')}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font)' }}
        >
          🔑 Đổi mật khẩu
        </button>

        <button
          onClick={handleLogout}
          style={{ background: 'var(--danger)', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'var(--font)' }}
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default Topbar;
