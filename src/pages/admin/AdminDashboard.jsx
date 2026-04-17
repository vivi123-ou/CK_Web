import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Modal from '../../components/Modal';
import { useToast } from '../../contexts/ToastContext';
import { userService } from '../../services/userService';
import { statisticsService } from '../../services/statisticsService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

const ROLES = ['ADMIN', 'GIAOVU', 'GIANGVIEN', 'SINHVIEN'];
const ROLE_LABELS = { ADMIN: 'Quản trị viên', GIAOVU: 'Giáo vụ', GIANGVIEN: 'Giảng viên', SINHVIEN: 'Sinh viên' };
const ROLE_BADGE = {
  ADMIN: 'badge-red',
  GIAOVU: 'badge-purple',
  GIANGVIEN: 'badge-blue',
  SINHVIEN: 'badge-green',
};

// ─── User Management ───────────────────────────────────────────────
function UserManagement() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const emptyForm = { name: '', email: '', role: 'SINHVIEN', password: '', status: 'ACTIVE' };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error('Không thể tải danh sách người dùng: ' + e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nhập họ tên'); return; }
    if (!form.email.trim()) { toast.error('Nhập email'); return; }
    if (!editing && !form.password.trim()) { toast.error('Nhập mật khẩu'); return; }
    try {
      if (editing) {
        await userService.update(editing.id, { name: form.name, role: form.role, status: form.status });
        toast.success('Cập nhật người dùng thành công');
      } else {
        await userService.create(form);
        toast.success('Tạo tài khoản thành công');
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (e) { toast.error('Lỗi: ' + e); }
  };

  const handleDelete = async () => {
    try {
      await userService.delete(deleteTarget.id);
      toast.success('Đã xóa người dùng');
      setShowDelete(false);
      load();
    } catch (e) { toast.error('Lỗi: ' + e); }
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, role: u.role, password: '', status: u.status || 'ACTIVE' });
    setShowForm(true);
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const stats = ROLES.map(r => ({ role: r, count: users.filter(u => u.role === r).length }));

  return (
    <>
      <div className="grid-4 mb-20">
        {stats.map(s => (
          <div key={s.role} className="card" style={{ marginBottom: 0 }}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 28 }}>{s.role === 'ADMIN' ? '👑' : s.role === 'GIAOVU' ? '🏫' : s.role === 'GIANGVIEN' ? '👨‍🏫' : '🎓'}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ou-blue)' }}>{s.count}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ROLE_LABELS[s.role]}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Danh sách người dùng</div>
            <div className="card-subtitle">{users.length} tài khoản trong hệ thống</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input className="form-input" style={{ width: 220 }} placeholder="🔍 Tìm theo tên, email..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="form-select" style={{ width: 140 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="">Tất cả vai trò</option>
              {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}>+ Thêm người dùng</button>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div>
          ) : (
            <table className="ou-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Không tìm thấy người dùng</td></tr>
                )}
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {u.avatar ? (
                          <img src={u.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--ou-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.email}</td>
                    <td>
                      <span className={`badge ${ROLE_BADGE[u.role] || 'badge-gray'}`}>{ROLE_LABELS[u.role] || u.role}</span>
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`}>
                        {u.status === 'ACTIVE' ? '● Hoạt động' : '○ Tạm khoá'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(u)}>Sửa</button>
                        <button className="btn btn-danger btn-sm" onClick={() => { setDeleteTarget(u); setShowDelete(true); }}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal tạo/sửa người dùng */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? `Sửa tài khoản – ${editing.name}` : 'Tạo tài khoản mới'}
        size="md"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Huỷ</button>
            <button className="btn btn-primary" onClick={handleSave}>
              {editing ? 'Cập nhật' : 'Tạo tài khoản'}
            </button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label">Họ và tên <span className="req">*</span></label>
          <input className="form-input" placeholder="Nhập họ và tên..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Email <span className="req">*</span></label>
          <input className="form-input" type="email" placeholder="example@ou.edu.vn" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} disabled={!!editing} />
          {editing && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Email không thể thay đổi sau khi tạo</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Vai trò <span className="req">*</span></label>
          <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </div>
        {!editing && (
          <div className="form-group">
            <label className="form-label">Mật khẩu khởi tạo <span className="req">*</span></label>
            <input className="form-input" type="password" placeholder="Tối thiểu 6 ký tự..." value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Người dùng có thể đổi mật khẩu sau khi đăng nhập lần đầu.</div>
          </div>
        )}
        {editing && (
          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Tạm khoá</option>
            </select>
          </div>
        )}
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Xác nhận xóa người dùng"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => setShowDelete(false)}>Huỷ</button>
            <button className="btn btn-danger" onClick={handleDelete}>Xóa người dùng</button>
          </div>
        }
      >
        <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <p style={{ fontSize: 15 }}>Bạn có chắc muốn xóa tài khoản <strong>{deleteTarget?.name}</strong>?</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Hành động này không thể hoàn tác.</p>
        </div>
      </Modal>
    </>
  );
}

// ─── Admin Statistics ──────────────────────────────────────────────
function AdminStatistics() {
  const toast = useToast();
  const [stats, setStats] = useState({ byYear: [], byMajor: [], overview: {} });
  const [loading, setLoading] = useState(true);
  const COLORS = ['#005BAA', '#0072CC', '#1A8FE3', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    (async () => {
      try {
        const [byYear, byMajor, overview] = await Promise.all([
          statisticsService.getScoresByYear(),
          statisticsService.getByMajor(),
          statisticsService.getOverview(),
        ]);
        setStats({
          byYear: Array.isArray(byYear) ? byYear : [],
          byMajor: Array.isArray(byMajor) ? byMajor : [],
          overview: overview || {},
        });
      } catch {
        toast.error('Không thể tải thống kê');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Đang tải...</div>;

  return (
    <div>
      <div className="grid-4 mb-20">
        {[
          { label: 'Tổng khoá luận', value: stats.overview.totalThesis ?? '-', icon: '📝' },
          { label: 'Hội đồng đã tạo', value: stats.overview.totalCouncils ?? '-', icon: '🏛️' },
          { label: 'Đã hoàn thành', value: stats.overview.completed ?? '-', icon: '✅' },
          { label: 'Điểm TB chung', value: stats.overview.avgScore ? stats.overview.avgScore.toFixed(1) : '-', icon: '⭐' },
        ].map(s => (
          <div key={s.label} className="card" style={{ marginBottom: 0 }}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 32 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ou-blue)' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Điểm TB theo năm học</div></div>
          <div className="card-body">
            {stats.byYear.length === 0
              ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Chưa có dữ liệu</div>
              : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={stats.byYear}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F6FF" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [v.toFixed ? v.toFixed(2) : v, '']} />
                    <Legend />
                    <Bar dataKey="avgScore" name="Điểm TB" fill="#005BAA" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="count" name="Số KL" fill="#1A8FE3" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Tần suất KL theo ngành</div></div>
          <div className="card-body">
            {stats.byMajor.length === 0
              ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Chưa có dữ liệu</div>
              : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={stats.byMajor} dataKey="count" nameKey="major" cx="50%" cy="50%" outerRadius={100}
                      label={({ major, percent }) => `${major}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.byMajor.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────
function AdminOverview() {
  const toast = useToast();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ total: '-', admin: '-', giaovu: '-', giangvien: '-', sinhvien: '-' });

  useEffect(() => {
    (async () => {
      try {
        const data = await userService.getAll();
        const list = Array.isArray(data) ? data : [];
        setCounts({
          total: list.length,
          admin: list.filter(u => u.role === 'ADMIN').length,
          giaovu: list.filter(u => u.role === 'GIAOVU').length,
          giangvien: list.filter(u => u.role === 'GIANGVIEN').length,
          sinhvien: list.filter(u => u.role === 'SINHVIEN').length,
        });
      } catch (e) {
        toast.error('Không thể tải: ' + e);
      }
    })();
  }, []);

  return (
    <div>
      <div className="grid-4 mb-20">
        {[
          { label: 'Tổng người dùng', value: counts.total, icon: '👥', color: '#005BAA', path: '/admin/users' },
          { label: 'Giáo vụ', value: counts.giaovu, icon: '🏫', color: '#8B5CF6', path: '/admin/users' },
          { label: 'Giảng viên', value: counts.giangvien, icon: '👨‍🏫', color: '#1A8FE3', path: '/admin/users' },
          { label: 'Sinh viên', value: counts.sinhvien, icon: '🎓', color: '#10B981', path: '/admin/users' },
        ].map(c => (
          <div key={c.label} className="card" style={{ marginBottom: 0, cursor: 'pointer' }} onClick={() => navigate(c.path)}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: 32, width: 56, height: 56, borderRadius: 12, background: c.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: '#EBF5FF', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ fontWeight: 700, color: 'var(--ou-blue)', marginBottom: 6 }}>📌 Chức năng Quản trị</div>
        <ul style={{ paddingLeft: 18, fontSize: 13.5, lineHeight: 1.9 }}>
          <li>Vào <strong>Quản lý người dùng</strong> để tạo, sửa, xóa tài khoản và phân quyền vai trò</li>
          <li>Vào <strong>Thống kê</strong> để xem báo cáo điểm khoá luận theo năm và theo ngành</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────
function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/admin', label: '📊 Tổng quan', exact: true },
    { path: '/admin/users', label: '👥 Người dùng' },
    { path: '/admin/statistics', label: '📈 Thống kê' },
  ];

  const isActive = (tab) => tab.exact ? location.pathname === tab.path : location.pathname.startsWith(tab.path);
  const activeTab = tabs.find(t => isActive(t));

  return (
    <MainLayout pageTitle={activeTab?.label?.replace(/^[\S]+ /, '') || 'Admin'} breadcrumb={`Admin / ${activeTab?.label?.replace(/^[\S]+ /, '') || ''}`}>
      <div className="tab-bar mb-20">
        {tabs.map(t => (
          <button key={t.path} className={`tab-btn ${isActive(t) ? 'active' : ''}`} onClick={() => navigate(t.path)}>
            {t.label}
          </button>
        ))}
      </div>

      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="statistics" element={<AdminStatistics />} />
      </Routes>
    </MainLayout>
  );
}

export default AdminDashboard;
