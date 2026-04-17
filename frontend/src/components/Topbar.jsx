import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Key, LogOut, ChevronRight } from 'lucide-react';

function Topbar({ pageTitle, breadcrumb }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="topbar">
      <div>
        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', letterSpacing: '-0.3px' }}>
          {pageTitle || 'Hệ thống'}
        </div>
        {breadcrumb && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            {breadcrumb.split('/').map((part, i, arr) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: i === arr.length - 1 ? 'var(--ou-blue-mid)' : 'var(--text-muted)', fontWeight: i === arr.length - 1 ? 600 : 400 }}>
                  {part.trim()}
                </span>
                {i < arr.length - 1 && <ChevronRight size={12} />}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', background: '#F4F8FE', borderRadius: 10, border: '1px solid #E2EEFB' }}>
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--ou-blue-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2 }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role}</div>
          </div>
        </div>

        <button
          onClick={() => navigate('/change-password')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #E2EEFB', borderRadius: 9, padding: '7px 13px', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font)', transition: 'all 0.18s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#0072CC'; e.currentTarget.style.color = '#0072CC'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2EEFB'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <Key size={14} strokeWidth={2} />
          Đổi mật khẩu
        </button>

        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '7px 13px', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#DC2626', fontFamily: 'var(--font)', transition: 'all 0.18s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
        >
          <LogOut size={14} strokeWidth={2} />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default Topbar;
