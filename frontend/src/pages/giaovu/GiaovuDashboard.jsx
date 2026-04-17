import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Modal from '../../components/Modal';
import { useToast } from '../../contexts/ToastContext';
import { thesisService } from '../../services/thesisService';
import { councilService } from '../../services/councilService';
import { criteriaService } from '../../services/criteriaService';
import { userService } from '../../services/userService';
import { statisticsService } from '../../services/statisticsService';
import { FileText, Building2, Star, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ─── Thesis Tab ────────────────────────────────────────────────────
function ThesisTab() {
  const toast = useToast();
  const [theses, setTheses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [showReviewer, setShowReviewer] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    title: '', major: '', studentIds: [], advisorIds: [], year: new Date().getFullYear(),
  });
  const [reviewerForm, setReviewerForm] = useState({ lecturerId: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, l, s] = await Promise.all([
        thesisService.getAll(),
        userService.getAll({ role: 'GIANGVIEN' }),
        userService.getAll({ role: 'SINHVIEN' }),
      ]);
      setTheses(Array.isArray(t) ? t : []);
      setLecturers(Array.isArray(l) ? l : []);
      setStudents(Array.isArray(s) ? s : []);
    } catch (e) {
      toast.error('Không thể tải dữ liệu: ' + e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error('Vui lòng nhập tên khoá luận'); return; }
    if (form.title.trim().length < 10) { toast.error('Tên khoá luận phải từ 10 ký tự trở lên'); return; }
    if (form.studentIds.length === 0) { toast.error('Chọn ít nhất 1 sinh viên'); return; }
    if (form.advisorIds.length === 0) { toast.error('Chọn ít nhất 1 giảng viên hướng dẫn'); return; }
    if (form.advisorIds.length > 2) { toast.error('Tối đa 2 giảng viên hướng dẫn'); return; }
    try {
      await thesisService.create(form);
      toast.success('Tạo khoá luận thành công');
      setShowCreate(false);
      setForm({ title: '', major: '', studentIds: [], advisorIds: [], year: new Date().getFullYear() });
      load();
    } catch (e) { toast.error('Lỗi: ' + e); }
  };

  const openEdit = (t) => {
    setEditForm({
      id: t.id,
      title: t.title,
      major: t.major,
      year: parseInt(t.year) || new Date().getFullYear(),
      description: t.description || ''
    });
    setShowEdit(true);
  };

  const handleUpdate = async () => {
    if (!editForm.title.trim()) { toast.error('Vui lòng nhập tên khoá luận'); return; }
    try {
      await thesisService.update(editForm.id, editForm);
      toast.success('Cập nhật thông tin thành công');
      setShowEdit(false);
      load();
    } catch (e) { toast.error('Lỗi: ' + e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khóa luận này? Dữ liệu không thể khôi phục!')) return;
    try {
      await thesisService.delete(id);
      toast.success('Đã xóa khóa luận thành công');
      load();
    } catch (e) { toast.error('Không thể xóa: Có thể khóa luận này đã được gắn vào Hội đồng hoặc đã có điểm.'); }
  };

  const handleAssignReviewer = async () => {
    if (!reviewerForm.lecturerId) { toast.error('Chọn giảng viên phản biện'); return; }
    try {
      await thesisService.assignReviewer(selectedThesis.id, reviewerForm.lecturerId);
      toast.success('Phân công phản biện thành công – đã gửi thông báo email');
      setShowReviewer(false);
      load();
    } catch (e) { toast.error('Lỗi: ' + e); }
  };

  const toggleMulti = (arr, val) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const filtered = theses.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.code?.toLowerCase().includes(search.toLowerCase())
  );

  const STATUS_BADGE = {
    CREATED: <span className="badge badge-yellow">Chờ xử lý</span>,
    PENDING: <span className="badge badge-yellow">Chờ xử lý</span>,
    ASSIGNED_REVIEWER: <span className="badge badge-blue">Đã có phản biện</span>,
    IN_PROGRESS: <span className="badge badge-blue">Đang thực hiện</span>,
    ASSIGNED_COUNCIL: <span className="badge badge-purple">Đã vào hội đồng</span>,
    GRADING: <span className="badge badge-purple">Đang chấm</span>,
    COMPLETED: <span className="badge badge-green">Hoàn thành</span>,
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Danh sách Khoá luận Tốt nghiệp</div>
            <div className="card-subtitle">{theses.length} khoá luận trong hệ thống</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="form-input"
              style={{ width: 240 }}
              placeholder="Tìm kiếm khoá luận..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Thêm khoá luận</button>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div>
          ) : (
            <table className="ou-table">
              <thead>
                <tr>
                  <th>Mã KL</th>
                  <th>Tên khoá luận</th>
                  <th>Sinh viên</th>
                  <th>GVHD</th>
                  <th>Phản biện</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Chưa có khoá luận nào</td></tr>
                )}
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td><span className="badge badge-blue">{t.code || `KL-${t.id}`}</span></td>
                    <td style={{ maxWidth: 280, fontWeight: 500 }}>{t.title}</td>
                    <td style={{ fontSize: 12 }}>{t.students?.map(s => s.name).join(', ') || '-'}</td>
                    <td style={{ fontSize: 12 }}>{t.advisors?.map(a => a.name).join(', ') || '-'}</td>
                    <td style={{ fontSize: 12 }}>{t.reviewer?.name || <span style={{ color: 'var(--text-muted)' }}>Chưa phân công</span>}</td>
                    <td>{STATUS_BADGE[t.status] || STATUS_BADGE['PENDING']}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)}>Sửa</button>
                        {(t.status === 'CREATED' || t.status === 'ASSIGNED_REVIEWER') && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Xóa</button>
                        )}
                        {!t.reviewer && (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => { setSelectedThesis(t); setReviewerForm({ lecturerId: '' }); setShowReviewer(true); }}
                          >
                            Phân công PB
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal tạo khoá luận */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Thêm Khoá luận Tốt nghiệp mới"
        size="lg"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => setShowCreate(false)}>Huỷ</button>
            <button className="btn btn-primary" onClick={handleCreate}>Lưu khoá luận</button>
          </div>
        }
      >
        <div className="grid-2">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Tên khoá luận <span className="req">*</span></label>
            <input className="form-input" placeholder="Nhập tên khoá luận..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Ngành</label>
            <input className="form-input" placeholder="VD: Công nghệ thông tin" value={form.major} onChange={e => setForm({ ...form, major: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Năm học</label>
            <input className="form-input" type="number" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Sinh viên thực hiện <span className="req">*</span></label>
          <div style={{ maxHeight: 160, overflowY: 'auto', border: '1.5px solid var(--border)', borderRadius: 8, padding: 8 }}>
            {students.map(s => (
              <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', cursor: 'pointer', borderRadius: 6, background: form.studentIds.includes(s.id) ? '#EBF5FF' : 'transparent' }}>
                <input type="checkbox" checked={form.studentIds.includes(s.id)} onChange={() => setForm({ ...form, studentIds: toggleMulti(form.studentIds, s.id) })} />
                <span style={{ fontSize: 13 }}>{s.name} <span style={{ color: 'var(--text-muted)' }}>({s.email})</span></span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Giảng viên hướng dẫn <span className="req">*</span> <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(tối đa 2)</span></label>
          <div style={{ maxHeight: 160, overflowY: 'auto', border: '1.5px solid var(--border)', borderRadius: 8, padding: 8 }}>
            {lecturers.map(l => (
              <label key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', cursor: 'pointer', borderRadius: 6, background: form.advisorIds.includes(l.id) ? '#EBF5FF' : 'transparent', opacity: !form.advisorIds.includes(l.id) && form.advisorIds.length >= 2 ? 0.4 : 1 }}>
                <input
                  type="checkbox"
                  checked={form.advisorIds.includes(l.id)}
                  disabled={!form.advisorIds.includes(l.id) && form.advisorIds.length >= 2}
                  onChange={() => setForm({ ...form, advisorIds: toggleMulti(form.advisorIds, l.id) })}
                />
                <span style={{ fontSize: 13 }}>{l.name} <span style={{ color: 'var(--text-muted)' }}>({l.email})</span></span>
              </label>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal Sửa khoá luận */}
      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Cập nhật thông tin Khoá luận"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => setShowEdit(false)}>Huỷ</button>
            <button className="btn btn-primary" onClick={handleUpdate}>Lưu thay đổi</button>
          </div>
        }
      >
        {editForm && (
          <div className="grid-1">
            <div className="form-group">
              <label className="form-label">Tên khoá luận <span className="req">*</span></label>
              <input className="form-input" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Ngành</label>
              <input className="form-input" value={editForm.major} onChange={e => setEditForm({ ...editForm, major: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Năm học</label>
              <input className="form-input" type="number" value={editForm.year} onChange={e => setEditForm({ ...editForm, year: parseInt(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label">Mô tả thêm</label>
              <textarea className="form-textarea" rows={3} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal phân công phản biện */}
      <Modal
        isOpen={showReviewer}
        onClose={() => setShowReviewer(false)}
        title={`Phân công Phản biện – ${selectedThesis?.title}`}
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => setShowReviewer(false)}>Huỷ</button>
            <button className="btn btn-primary" onClick={handleAssignReviewer}>Phân công &amp; Gửi email</button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label">Chọn Giảng viên phản biện <span className="req">*</span></label>
          <select
            className="form-select"
            value={reviewerForm.lecturerId}
            onChange={e => setReviewerForm({ lecturerId: e.target.value ? parseInt(e.target.value) : '' })}
          >
            <option value="">-- Chọn giảng viên --</option>
            {lecturers
              .filter(l => !selectedThesis?.advisors?.some(a => a.id === l.id))
              .map(l => (
                <option key={l.id} value={l.id}>{l.name} – {l.email}</option>
              ))}
          </select>
        </div>
        <div style={{ background: '#FFF7E6', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#92400E' }}>
           Hệ thống sẽ tự động gửi email thông báo đến giảng viên được phân công.
        </div>
      </Modal>
    </>
  );
}

// ─── Council Tab ───────────────────────────────────────────────────
function CouncilTab() {
  const toast = useToast();
  const [councils, setCouncils] = useState([]);
  const [theses, setTheses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCouncil, setSelectedCouncil] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const emptyForm = {
    id: null, name: '', date: '', room: '',
    members: [], thesisIds: [],
  };
  const [form, setForm] = useState(emptyForm);

  const COUNCIL_ROLES = ['CHU_TICH', 'THU_KY', 'PHAN_BIEN', 'THANH_VIEN'];
  const COUNCIL_ROLE_LABELS = {
    CHU_TICH: 'Chủ tịch', THU_KY: 'Thư ký', PHAN_BIEN: 'Phản biện', THANH_VIEN: 'Thành viên',
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, t, l] = await Promise.all([
        councilService.getAll(),
        thesisService.getAll(),
        userService.getAll({ role: 'GIANGVIEN' }),
      ]);
      setCouncils(Array.isArray(c) ? c : []);
      setTheses(Array.isArray(t) ? t : []);
      setLecturers(Array.isArray(l) ? l : []);
    } catch (e) {
      toast.error('Không thể tải dữ liệu: ' + e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addMember = (lecturerId) => {
    if (form.members.find(m => m.lecturerId === lecturerId)) return;
    if (form.members.length >= 5) { toast.error('Hội đồng tối đa 5 giảng viên'); return; }
    setForm({ ...form, members: [...form.members, { lecturerId, councilRole: 'THANH_VIEN' }] });
  };

  const removeMember = (lecturerId) => {
    setForm({ ...form, members: form.members.filter(m => m.lecturerId !== lecturerId) });
  };

  const updateRole = (lecturerId, role) => {
    setForm({ ...form, members: form.members.map(m => m.lecturerId === lecturerId ? { ...m, councilRole: role } : m) });
  };

  const toggleThesis = (id) => {
    if (form.thesisIds.includes(id)) {
      setForm({ ...form, thesisIds: form.thesisIds.filter(x => x !== id) });
    } else {
      if (form.thesisIds.length >= 5) { toast.error('Hội đồng tối đa 5 khoá luận'); return; }
      setForm({ ...form, thesisIds: [...form.thesisIds, id] });
    }
  };

  const validate = () => {
    if (!form.name.trim()) { toast.error('Nhập tên hội đồng'); return false; }
    if (form.members.length < 3) { toast.error('Hội đồng cần ít nhất 3 giảng viên'); return false; }
    const hasCT = form.members.some(m => m.councilRole === 'CHU_TICH');
    const hasTK = form.members.some(m => m.councilRole === 'THU_KY');
    const hasPB = form.members.some(m => m.councilRole === 'PHAN_BIEN');
    if (!hasCT) { toast.error('Cần chỉ định 1 Chủ tịch hội đồng'); return false; }
    if (!hasTK) { toast.error('Cần chỉ định 1 Thư ký'); return false; }
    if (!hasPB) { toast.error('Cần chỉ định 1 Phản biện'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      if (isEditing) {
        await councilService.update(form.id, form);
        toast.success('Cập nhật hội đồng thành công');
      } else {
        await councilService.create(form);
        toast.success('Thành lập hội đồng thành công');
      }
      setShowCreate(false);
      setForm(emptyForm);
      setIsEditing(false);
      load();
    } catch (e) { toast.error('Lỗi: ' + e); }
  };

  const handleLock = async (council) => {
    if (!window.confirm(`Khoá hội đồng "${council.name}"? Giảng viên sẽ không thể sửa điểm sau khi khoá.`)) return;
    try {
      await councilService.lock(council.id);
      toast.success('Đã khoá hội đồng – sinh viên sẽ nhận email thông báo điểm');
      load();
    } catch (e) { toast.error('Lỗi: ' + e); }
  };

  const openEdit = (council) => {
    setForm({
      id: council.id,
      name: council.name,
      date: council.date || '',
      room: council.room || '',
      members: council.members ? council.members.map(m => ({ lecturerId: m.lecturerId, councilRole: m.councilRole })) : [],
      thesisIds: council.theses ? council.theses.map(t => t.id) : []
    });
    setIsEditing(true);
    setShowCreate(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hội đồng này không?')) return;
    try {
      await councilService.delete(id);
      toast.success('Đã xóa hội đồng thành công');
      load();
    } catch (e) { toast.error('Không thể xóa hội đồng này: ' + e); }
  };

  const handleExportPDF = async (council) => {
    const el = document.getElementById(`council-detail-${council.id}`);
    if (!el) return;
    toast.info('Đang tạo PDF...');
    try {
      const canvas = await html2canvas(el, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`bao-cao-hoi-dong-${council.name}.pdf`);
      toast.success('Xuất PDF thành công');
    } catch (e) { toast.error('Lỗi xuất PDF: ' + e); }
  };

  const STATUS_BADGE = {
    DRAFT: <span className="badge badge-yellow">Bản nháp</span>,
    ACTIVE: <span className="badge badge-green">Đang hoạt động</span>,
    LOCKED: <span className="badge badge-red">Đã khoá</span>,
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Danh sách Hội đồng Bảo vệ</div>
            <div className="card-subtitle">{councils.length} hội đồng</div>
          </div>
          <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setIsEditing(false); setShowCreate(true); }}>
            + Thành lập hội đồng
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div>
          ) : (
            <table className="ou-table">
              <thead>
                <tr>
                  <th>Tên hội đồng</th>
                  <th>Số GV</th>
                  <th>Số KL chấm</th>
                  <th>Ngày bảo vệ</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {councils.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Chưa có hội đồng nào</td></tr>
                )}
                {councils.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.members?.length || 0}/5</td>
                    <td>{c.theses?.length || 0}/5</td>
                    <td>{c.date || '-'}</td>
                    <td>{STATUS_BADGE[c.status] || STATUS_BADGE['ACTIVE']}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => { setSelectedCouncil(c); setShowDetail(true); }}>Chi tiết</button>
                        {c.status !== 'LOCKED' && (
                          <>
                            <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Sửa</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleLock(c)}>Khoá</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Xóa</button>
                          </>
                        )}
                        <button className="btn btn-success btn-sm" onClick={() => handleExportPDF(c)}>Xuất PDF</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Hidden printable council detail for PDF */}
      {councils.map(c => (
        <div key={c.id} id={`council-detail-${c.id}`} style={{ position: 'absolute', left: -9999, top: 0, width: 800, padding: 40, background: '#fff', fontFamily: 'sans-serif' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 8 }}>BẢNG ĐIỂM HỘI ĐỒNG BẢO VỆ KHOÁ LUẬN TỐT NGHIỆP</h2>
          <p style={{ textAlign: 'center', marginBottom: 24, color: '#666' }}>Hội đồng: {c.name} | Ngày bảo vệ: {c.date || '...'}</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#003D7A', color: '#fff' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Khoá luận</th>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Sinh viên</th>
                {(c.members || []).map(m => (
                  <th key={m.lecturerId} style={{ padding: '10px 12px', textAlign: 'center' }}>{m.lecturerName}</th>
                ))}
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Điểm TB</th>
              </tr>
            </thead>
            <tbody>
              {(c.theses || []).map((t, i) => (
                <tr key={t.id} style={{ background: i % 2 === 0 ? '#F7FAFF' : '#fff' }}>
                  <td style={{ padding: '10px 12px' }}>{t.title}</td>
                  <td style={{ padding: '10px 12px' }}>{t.students?.map(s => s.name).join(', ')}</td>
                  {(c.members || []).map(m => (
                    <td key={m.lecturerId} style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {t.scores?.find(s => s.lecturerId === m.lecturerId)?.total ?? '-'}
                    </td>
                  ))}
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>{t.avgScore ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 40, fontSize: 12, color: '#999', textAlign: 'right' }}>Xuất từ Hệ thống Quản lý Khoá luận TN – ĐH Mở TP.HCM</p>
        </div>
      ))}

      {/* Modal chi tiết hội đồng */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={`Chi tiết: ${selectedCouncil?.name}`}
        size="lg"
      >
        {selectedCouncil && (
          <div>
            <div className="grid-2 mb-16">
              <div><strong>Tên hội đồng:</strong> {selectedCouncil.name}</div>
              <div><strong>Ngày bảo vệ:</strong> {selectedCouncil.date || 'Chưa xác định'}</div>
              <div><strong>Trạng thái:</strong> {selectedCouncil.status === 'LOCKED' ? 'Đã khoá' : (selectedCouncil.status === 'ACTIVE' ? 'Đang hoạt động' : 'Bản nháp')}</div>
              <div><strong>Phòng:</strong> {selectedCouncil.room || '-'}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Thành viên hội đồng ({selectedCouncil.members?.length || 0}/5)</div>
              <table className="ou-table">
                <thead><tr><th>Giảng viên</th><th>Email</th><th>Vai trò</th></tr></thead>
                <tbody>
                  {(selectedCouncil.members || []).map(m => (
                    <tr key={m.lecturerId}>
                      <td>{m.lecturerName}</td>
                      <td>{m.lecturerEmail}</td>
                      <td><span className="badge badge-blue">{COUNCIL_ROLE_LABELS[m.councilRole] || m.councilRole}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Khoá luận được chấm ({selectedCouncil.theses?.length || 0}/5)</div>
              <table className="ou-table">
                <thead><tr><th>Tên khoá luận</th><th>Sinh viên</th><th>Điểm TB</th></tr></thead>
                <tbody>
                  {(selectedCouncil.theses || []).map(t => (
                    <tr key={t.id}>
                      <td>{t.title}</td>
                      <td>{t.students?.map(s => s.name).join(', ')}</td>
                      <td style={{ fontWeight: 700 }}>{t.avgScore ?? <span style={{ color: 'var(--text-muted)' }}>Chưa có</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal tạo hội đồng */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title={isEditing ? 'Cập nhật Hội đồng Bảo vệ' : 'Thành lập Hội đồng Bảo vệ'}
        size="xl"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => setShowCreate(false)}>Huỷ</button>
            <button className="btn btn-primary" onClick={handleSave}>
              {isEditing ? 'Lưu thay đổi' : 'Thành lập hội đồng'}
            </button>
          </div>
        }
      >
        <div className="grid-2 mb-16">
          <div className="form-group">
            <label className="form-label">Tên hội đồng <span className="req">*</span></label>
            <input className="form-input" placeholder="VD: HĐ-CNTT-01" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Ngày bảo vệ</label>
            <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Phòng</label>
            <input className="form-input" placeholder="VD: B101" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">
              Thêm Giảng viên <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(3–5 người)</span>
            </label>
            <select className="form-select" onChange={e => { if (e.target.value) addMember(parseInt(e.target.value)); e.target.value = ''; }}>
              <option value="">-- Chọn giảng viên để thêm --</option>
              {lecturers.filter(l => !form.members.find(m => m.lecturerId === l.id)).map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>

            {form.members.length > 0 && (
              <div style={{ marginTop: 10 }}>
                {form.members.map(m => {
                  const lec = lecturers.find(l => l.id === m.lecturerId);
                  return (
                    <div key={m.lecturerId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ flex: 1, fontSize: 13 }}>{lec?.name || m.lecturerName}</span>
                      <select
                        className="form-select"
                        style={{ width: 130, padding: '4px 8px', fontSize: 12 }}
                        value={m.councilRole}
                        onChange={e => updateRole(m.lecturerId, e.target.value)}
                      >
                        {COUNCIL_ROLES.map(r => (
                          <option key={r} value={r}>{COUNCIL_ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                      <button onClick={() => removeMember(m.lecturerId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 16 }}>✕</button>
                    </div>
                  );
                })}
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                  {form.members.length}/5 giảng viên
                  {!form.members.some(m => m.councilRole === 'CHU_TICH') && <span style={{ color: 'var(--danger)' }}> – Chưa có Chủ tịch</span>}
                  {!form.members.some(m => m.councilRole === 'THU_KY') && <span style={{ color: 'var(--danger)' }}> – Chưa có Thư ký</span>}
                  {!form.members.some(m => m.councilRole === 'PHAN_BIEN') && <span style={{ color: 'var(--danger)' }}> – Chưa có Phản biện</span>}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Khoá luận được chấm <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(tối đa 5)</span>
            </label>
            <div style={{ maxHeight: 240, overflowY: 'auto', border: '1.5px solid var(--border)', borderRadius: 8, padding: 8 }}>
              {theses.map(t => (
                <label key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 6px', cursor: 'pointer', borderRadius: 6, background: form.thesisIds.includes(t.id) ? '#EBF5FF' : 'transparent', opacity: !form.thesisIds.includes(t.id) && form.thesisIds.length >= 5 ? 0.4 : 1 }}>
                  <input
                    type="checkbox"
                    checked={form.thesisIds.includes(t.id)}
                    disabled={!form.thesisIds.includes(t.id) && form.thesisIds.length >= 5}
                    onChange={() => toggleThesis(t.id)}
                    style={{ marginTop: 2 }}
                  />
                  <span style={{ fontSize: 12 }}>{t.title}</span>
                </label>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{form.thesisIds.length}/5 khoá luận</div>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ─── Criteria Tab ──────────────────────────────────────────────────
function CriteriaTab() {
  const toast = useToast();
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', maxScore: 10, description: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await criteriaService.getAll();
      setCriteria(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error('Không thể tải tiêu chí: ' + e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nhập tên tiêu chí'); return; }
    if (!form.maxScore || form.maxScore <= 0) { toast.error('Điểm tối đa phải > 0'); return; }
    try {
      if (editing) {
        await criteriaService.update(editing.id, form);
        toast.success('Cập nhật tiêu chí thành công');
      } else {
        await criteriaService.create(form);
        toast.success('Thêm tiêu chí thành công');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', maxScore: 10, description: '' });
      load();
    } catch (e) { toast.error('Lỗi: ' + e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa tiêu chí này?')) return;
    try {
      await criteriaService.delete(id);
      toast.success('Đã xóa tiêu chí');
      load();
    } catch (e) { toast.error('Lỗi: ' + e); }
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, maxScore: c.maxScore, description: c.description || '' });
    setShowForm(true);
  };

  const totalMax = criteria.reduce((s, c) => s + (c.maxScore || 0), 0);

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Tiêu chí Chấm điểm</div>
            <div className="card-subtitle">Tổng điểm tối đa: {totalMax} điểm</div>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: '', maxScore: 10, description: '' }); setShowForm(true); }}>
            + Thêm tiêu chí
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div>
          ) : (
            <table className="ou-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên tiêu chí</th>
                  <th>Điểm tối đa</th>
                  <th>Mô tả</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {criteria.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Chưa có tiêu chí nào</td></tr>
                )}
                {criteria.map((c, i) => (
                  <tr key={c.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td><span className="badge badge-blue">{c.maxScore} điểm</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.description || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Sửa</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Sửa tiêu chí' : 'Thêm tiêu chí mới'}
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Huỷ</button>
            <button className="btn btn-primary" onClick={handleSave}>Lưu</button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label">Tên tiêu chí <span className="req">*</span></label>
          <input className="form-input" placeholder="VD: Nội dung và tính khoa học" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Điểm tối đa <span className="req">*</span></label>
          <input className="form-input" type="number" min="0.5" max="10" step="0.5" value={form.maxScore} onChange={e => setForm({ ...form, maxScore: parseFloat(e.target.value) })} />
        </div>
        <div className="form-group">
          <label className="form-label">Mô tả</label>
          <textarea className="form-textarea" rows={3} placeholder="Mô tả tiêu chí..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>
    </>
  );
}

// ─── Statistics Tab ────────────────────────────────────────────────
function StatisticsTab() {
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

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải thống kê...</div>;

  return (
    <div>
      <div className="grid-4 mb-20">
        {[
          { label: 'Tổng khoá luận', value: stats.overview.totalThesis ?? '-', icon: <FileText size={26} />, color: '#005BAA' },
          { label: 'Đang thực hiện', value: stats.overview.inProgress ?? '-', icon: <Clock size={26} />, color: '#F59E0B' },
          { label: 'Đã hoàn thành', value: stats.overview.completed ?? '-', icon: <CheckCircle size={26} />, color: '#10B981' },
          { label: 'Điểm TB chung', value: stats.overview.avgScore ? stats.overview.avgScore.toFixed(1) : '-', icon: <TrendingUp size={26} />, color: '#8B5CF6' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ marginBottom: 0 }}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Điểm TB theo năm học</div>
          </div>
          <div className="card-body">
            {stats.byYear.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Chưa có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.byYear}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F6FF" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [v.toFixed(2), 'Điểm TB']} />
                  <Legend />
                  <Bar dataKey="avgScore" name="Điểm TB" fill="#005BAA" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="count" name="Số KL" fill="#1A8FE3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Tần suất KL theo ngành</div>
          </div>
          <div className="card-body">
            {stats.byMajor.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Chưa có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={stats.byMajor}
                    dataKey="count"
                    nameKey="major"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ major, percent }) => `${major}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.byMajor.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
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
function GiaovuOverview() {
  const toast = useToast();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ thesis: '-', councils: '-', criteria: '-' });

  useEffect(() => {
    (async () => {
      try {
        const [t, c, cr] = await Promise.all([
          thesisService.getAll(),
          councilService.getAll(),
          criteriaService.getAll(),
        ]);
        setCounts({
          thesis: Array.isArray(t) ? t.length : 0,
          councils: Array.isArray(c) ? c.length : 0,
          criteria: Array.isArray(cr) ? cr.length : 0,
        });
      } catch (e) {
        toast.error('Không thể tải dữ liệu: ' + e);
      }
    })();
  }, []);

  const cards = [
    { label: 'Tổng khoá luận', value: counts.thesis, icon: <FileText size={26} />, color: '#005BAA', path: '/giaovu/thesis' },
    { label: 'Hội đồng', value: counts.councils, icon: <Building2 size={26} />, color: '#10B981', path: '/giaovu/councils' },
    { label: 'Tiêu chí chấm', value: counts.criteria, icon: <Star size={26} />, color: '#F59E0B', path: '/giaovu/criteria' },
  ];

  return (
    <div>
      <div className="grid-3 mb-20">
        {cards.map(c => (
          <div key={c.label} className="card" style={{ marginBottom: 0, cursor: 'pointer' }} onClick={() => navigate(c.path)}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: 14, background: c.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: '#EBF5FF', borderRadius: 12, padding: '18px 22px', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--ou-blue)' }}>Hướng dẫn sử dụng</div>
        <ul style={{ paddingLeft: 20, color: 'var(--text)', fontSize: 13.5, lineHeight: 1.8 }}>
          <li>Vào <strong>Khoá luận</strong> để thêm mới và phân công giảng viên phản biện</li>
          <li>Vào <strong>Hội đồng</strong> để thành lập hội đồng, gán khoá luận và khoá hội đồng sau khi bảo vệ</li>
          <li>Vào <strong>Tiêu chí</strong> để thiết lập bộ tiêu chí chấm điểm trước khi chấm</li>
          <li>Vào <strong>Thống kê</strong> để xem báo cáo điểm theo năm và theo ngành</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────
function GiaovuDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/giaovu', label: 'Tổng quan', exact: true },
    { path: '/giaovu/thesis', label: 'Khoá luận' },
    { path: '/giaovu/councils', label: 'Hội đồng' },
    { path: '/giaovu/criteria', label: 'Tiêu chí' },
    { path: '/giaovu/statistics', label: 'Thống kê' },
  ];

  const isActive = (tab) => tab.exact ? location.pathname === tab.path : location.pathname.startsWith(tab.path);

  const activeTab = tabs.find(t => isActive(t));

  return (
    <MainLayout pageTitle={activeTab?.label || 'Giáo vụ'} breadcrumb={`Giáo vụ / ${activeTab?.label || ''}`}>
      <div className="tab-bar mb-20">
        {tabs.map(t => (
          <button key={t.path} className={`tab-btn ${isActive(t) ? 'active' : ''}`} onClick={() => navigate(t.path)}>
            {t.label}
          </button>
        ))}
      </div>

      <Routes>
        <Route index element={<GiaovuOverview />} />
        <Route path="thesis" element={<ThesisTab />} />
        <Route path="councils" element={<CouncilTab />} />
        <Route path="criteria" element={<CriteriaTab />} />
        <Route path="statistics" element={<StatisticsTab />} />
      </Routes>
    </MainLayout>
  );
}

export default GiaovuDashboard;