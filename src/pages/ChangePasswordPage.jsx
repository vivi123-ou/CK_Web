import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

function ChangePasswordPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = async () => {
    if (!form.oldPassword) { toast.error('Nhập mật khẩu hiện tại'); return; }
    if (!form.newPassword || form.newPassword.length < 6) { toast.error('Mật khẩu mới tối thiểu 6 ký tự'); return; }
    if (form.newPassword !== form.confirmPassword) { toast.error('Mật khẩu xác nhận không khớp'); return; }
    if (form.oldPassword === form.newPassword) { toast.error('Mật khẩu mới phải khác mật khẩu cũ'); return; }

    setLoading(true);
    try {
      await authService.changePassword(form.oldPassword, form.newPassword);
      toast.success('Đổi mật khẩu thành công');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => navigate(-1), 1500);
    } catch (e) {
      toast.error(typeof e === 'string' ? e : 'Mật khẩu cũ không đúng');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.newPassword.length === 0 ? 0
    : form.newPassword.length < 6 ? 1
    : form.newPassword.length < 10 ? 2
    : 3;
  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Mạnh'];
  const strengthColor = ['', 'var(--danger)', 'var(--warning)', 'var(--success)'];

  return (
    <MainLayout pageTitle="Đổi mật khẩu" breadcrumb="Tài khoản / Đổi mật khẩu">
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Đổi mật khẩu</div>
              <div className="card-subtitle">Tài khoản: {user?.name} ({user?.email})</div>
            </div>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Mật khẩu hiện tại <span className="req">*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showOld ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu hiện tại..."
                  value={form.oldPassword}
                  onChange={e => setForm({ ...form, oldPassword: e.target.value })}
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowOld(!showOld)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>
                  {showOld ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu mới <span className="req">*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự..."
                  value={form.newPassword}
                  onChange={e => setForm({ ...form, newPassword: e.target.value })}
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>
                  {showNew ? '🙈' : '👁'}
                </button>
              </div>
              {form.newPassword.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= strength ? strengthColor[strength] : 'var(--border)', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: strengthColor[strength] }}>{strengthLabel[strength]}</div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu mới <span className="req">*</span></label>
              <input
                className="form-input"
                type="password"
                placeholder="Nhập lại mật khẩu mới..."
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                style={{ borderColor: form.confirmPassword && form.confirmPassword !== form.newPassword ? 'var(--danger)' : '' }}
              />
              {form.confirmPassword && form.confirmPassword !== form.newPassword && (
                <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>❌ Mật khẩu không khớp</div>
              )}
              {form.confirmPassword && form.confirmPassword === form.newPassword && (
                <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 4 }}>✅ Mật khẩu khớp</div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ flex: 1 }}>Huỷ</button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{ flex: 1, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? '⏳ Đang xử lý...' : '🔑 Đổi mật khẩu'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default ChangePasswordPage;
