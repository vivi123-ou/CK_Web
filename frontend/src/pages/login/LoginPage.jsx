import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const ROLE_HOME = {
  ADMIN: '/admin',
  GIAOVU: '/giaovu',
  GIANGVIEN: '/giangvien',
  SINHVIEN: '/sinhvien',
};

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoErr, setLogoErr] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      navigate(ROLE_HOME[user.role] || '/login');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Email hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleLogin(); };

  return (
    <div className="login-page">

      {/* ── LEFT PANEL ── */}
      <div className="left-panel">
        {/* Decorative shapes */}
        <div className="geometric geo1" />
        <div className="geometric geo2" />
        <div className="geometric geo3" />

        {/* Logo */}
        <div className="logo-wrap">
          {!logoErr ? (
            <img
              src="/logo-ou-white.png"
              alt="Logo ĐH Mở TP.HCM"
              style={{ height: 48, objectFit: 'contain' }}
              onError={() => setLogoErr(true)}
            />
          ) : (
            <div className="logo-circle">OU</div>
          )}
          <div className="logo-text">
            <div className="uni-name">Trường ĐH Mở TP.HCM</div>
            <div className="sys-name">Hệ thống Quản lý Khoá luận TN</div>
          </div>
        </div>

        {/* Title */}
        <div className="left-title">
          <h1>Quản lý <span>Khoá luận</span><br />Tốt nghiệp</h1>
          <p>Nền tảng số hoá toàn bộ quy trình từ đăng ký đề tài, phân công hướng dẫn đến bảo vệ và công bố điểm.</p>
        </div>

        {/* Stats — thay thế feature list */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: 0, background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 20px', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ou-accent)' }}>4</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>Vai trò người dùng</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ou-accent)' }}>100%</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>Số hóa quy trình</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ou-accent)' }}>PDF</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>Xuất báo cáo</div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="right-panel">
        <div className="login-box">

          <div className="login-header">
            <div className="welcome">ĐĂNG NHẬP BẢO MẬT</div>
            <h2>Đăng nhập hệ thống</h2>
            <p>Nhập email và mật khẩu được cấp bởi Giáo vụ</p>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 8, padding: '10px 14px',
              fontSize: 13, color: '#991B1B', marginBottom: 16,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', flexShrink: 0, display: 'inline-block' }} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email / Mã số</label>
            <input
              className="form-input"
              type="text"
              placeholder="Nhập email hoặc mã số..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div className="input-wrap">
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: 'var(--text-muted)', display: 'flex', padding: 4 }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            className="btn-login"
            onClick={handleLogin}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading && (
              <span style={{
                width: 16, height: 16,
                border: '2px solid rgba(255,255,255,0.35)',
                borderTopColor: '#fff', borderRadius: '50%',
                animation: 'spin 0.7s linear infinite', display: 'inline-block',
              }} />
            )}
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <div className="login-footer">
            Cần hỗ trợ? <a href="#">Liên hệ Giáo vụ khoa</a>
          </div>
        </div>
      </div>

    </div>
  );
}

export default LoginPage;
