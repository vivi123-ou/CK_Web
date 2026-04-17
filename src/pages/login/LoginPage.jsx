import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
      setError(typeof err === 'string' ? err : 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <>
      <div className="left-panel">
        <div className="geometric geo1"></div>
        <div className="geometric geo2"></div>
        <div className="geometric geo3"></div>

        <div className="logo-wrap">
          <div className="logo-circle">OU</div>
          <div className="logo-text">
            <div className="uni-name">Trường ĐH Mở TP.HCM</div>
            <div className="sys-name">Hệ thống Quản lý<br />Khoá luận TN</div>
          </div>
        </div>

        <div className="left-title">
          <h1>Quản lý <span>Khoá luận</span><br />Tốt nghiệp</h1>
          <p>Nền tảng số hóa toàn bộ quy trình từ đăng ký đề tài đến bảo vệ và công bố điểm.</p>
        </div>

        <div className="feature-list">
          <div className="feature-item">
            <div className="feature-icon">📋</div>
            <span>Quản lý hội đồng &amp; phân công phản biện</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⭐</div>
            <span>Chấm điểm theo tiêu chí – tổng hợp tự động</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📊</div>
            <span>Thống kê &amp; xuất báo cáo PDF</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔔</div>
            <span>Thông báo email tự động cho sinh viên</span>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="login-box">
          <div className="login-header">
            <div className="welcome">Chào mừng trở lại</div>
            <h2>Đăng nhập hệ thống</h2>
            <p>Nhập email và mật khẩu được cấp bởi Giáo vụ</p>
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 8 }}>
              ❌ {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email / Mã số</label>
            <div className="input-wrap">
              <span className="input-icon">✉️</span>
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
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div className="input-wrap">
              <span className="input-icon">🔒</span>
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button className="eye-btn" onClick={() => setShowPassword(!showPassword)} type="button">
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            className="btn-login"
            onClick={handleLogin}
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? '⏳ Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <div className="divider"><span>hoặc tiếp tục với</span></div>

          <div className="social-btns">
            <button className="btn-social">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
              Google
            </button>
            <button className="btn-social">
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" alt="Facebook" />
              Facebook
            </button>
          </div>

          <div className="login-footer">
            Cần hỗ trợ? <a href="#">Liên hệ Giáo vụ khoa</a>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
