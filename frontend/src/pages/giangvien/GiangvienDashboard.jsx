import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, PenLine, BookOpen } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { thesisService } from '../../services/thesisService';
import { criteriaService } from '../../services/criteriaService';
import { scoreService } from '../../services/scoreService';

// ─── Grading Tab ───────────────────────────────────────────────────
function GradingTab() {
  const { user } = useAuth();
  const toast = useToast();
  const [assignments, setAssignments] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [scores, setScores] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedScores, setSavedScores] = useState({});

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [gradeId, setGradeId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [theses, crits] = await Promise.all([
        thesisService.getByLecturer(user.id),
        criteriaService.getAll(),
      ]);
      const gradingList = (Array.isArray(theses) ? theses : []).filter(
        t => t.councilStatus != null && t.councilStatus !== 'LOCKED'
      );
      setAssignments(gradingList);
      setCriteria(Array.isArray(crits) ? crits : []);
    } catch (e) {
      toast.error('Không thể tải dữ liệu: ' + e);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  const loadExistingScores = async (thesis) => {
    try {
      const data = await scoreService.getByThesis(thesis.id);
      const myScores = Array.isArray(data) ? data.find(s => s.lecturerId === user.id) : null;
      if (myScores?.details) {
        const map = {};
        myScores.details.forEach(d => { map[d.criteriaId] = d.score; });
        setScores(map);
        setSavedScores(map);
        setIsConfirmed(myScores.confirmed || false);
        setGradeId(myScores.id);
      } else {
        setScores({});
        setSavedScores({});
        setIsConfirmed(false);
        setGradeId(null);
      }
    } catch {
      setScores({});
      setIsConfirmed(false);
      setGradeId(null);
    }
  };

  const handleSelectThesis = (thesis) => {
    setSelectedThesis(thesis);
    loadExistingScores(thesis);
  };

  const handleScoreChange = (criteriaId, value) => {
    const max = 10; // Thang điểm 10 chuẩn
    const parsed = Math.min(Math.max(parseFloat(value) || 0, 0), max);
    setScores(prev => ({ ...prev, [criteriaId]: parsed }));
  };

  // Tính tổng điểm dựa trên trọng số % (Kết quả thang 10)
  const totalScore = criteria.reduce((sum, c) => {
    const score = scores[c.id] || 0;
    const weightPercent = c.maxScore || 0; 
    return sum + (score * weightPercent / 100);
  }, 0);

  const handleSave = async () => {
    if (!selectedThesis) return;
    setSaving(true);
    try {
      const details = criteria.map(c => ({ criteriaId: c.id, score: scores[c.id] || 0 }));
      const res = await scoreService.saveScore({
        thesisId: selectedThesis.id,
        lecturerId: user.id,
        details,
        total: Math.round(totalScore * 10) / 10,
      });
      setSavedScores({ ...scores });
      if (res?.data?.id || res?.id) setGradeId(res.data?.id || res.id);
      toast.success('Lưu điểm nháp thành công');
    } catch (e) {
      toast.error('Lỗi lưu điểm: ' + e);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn XÁC NHẬN điểm? Sau khi xác nhận sẽ KHÔNG THỂ sửa lại!')) return;
    setSaving(true);
    try {
      const details = criteria.map(c => ({ criteriaId: c.id, score: scores[c.id] || 0 }));
      const savedGrade = await scoreService.saveScore({
        thesisId: selectedThesis.id,
        lecturerId: user.id,
        details,
        total: Math.round(totalScore * 10) / 10,
      });
      const currentGradeId = savedGrade?.data?.id || savedGrade?.id || gradeId;
      if (!currentGradeId) {
        toast.error('Không tìm thấy mã bảng điểm để xác nhận');
        return;
      }
      await scoreService.confirmScore(currentGradeId);
      setIsConfirmed(true);
      toast.success('Đã xác nhận điểm thành công!');
      load();
    } catch (e) {
      toast.error('Lỗi xác nhận điểm: ' + e);
    } finally {
      setSaving(false);
    }
  };

  const isLocked = selectedThesis?.councilStatus === 'LOCKED';
  const disableEdit = isLocked || isConfirmed;

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div>;

  return (
    <div className="grid-2" style={{ alignItems: 'flex-start' }}>
      <div className="card" style={{ marginBottom: 0 }}>
        <div className="card-header">
          <div className="card-title">Khoá luận cần chấm điểm</div>
          <span className="badge badge-blue">{assignments.length}</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {assignments.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle size={40} style={{ margin: '0 auto 8px', color: '#10B981' }} />
              <div>Không có khoá luận nào cần chấm</div>
            </div>
          ) : (
            assignments.map(t => (
              <div
                key={t.id}
                onClick={() => handleSelectThesis(t)}
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: selectedThesis?.id === t.id ? '#EBF5FF' : 'transparent',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 6px' }}>
                  SV: {t.students?.map(s => s.name).join(', ') || '-'} | HĐ: {t.councilName}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className={`badge ${t.councilStatus === 'LOCKED' ? 'badge-red' : 'badge-green'}`}>
                    {t.councilStatus === 'LOCKED' ? 'Đã khoá' : 'Đang mở'}
                  </span>
                  {t.myScore != null && <span className="badge badge-blue">Đã chấm: {t.myScore}/10</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        {!selectedThesis ? (
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-body" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <PenLine size={44} style={{ margin: '0 auto 12px', color: '#CBD5E1' }} />
              <div style={{ fontWeight: 600 }}>Chọn khoá luận để chấm điểm</div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div>
                <div className="card-title">Chấm điểm Khoá luận</div>
                <div className="card-subtitle" style={{ maxWidth: 380 }}>{selectedThesis.title}</div>
              </div>
              {isConfirmed && <span className="badge badge-green">Đã xác nhận</span>}
            </div>
            <div className="card-body">
              <div style={{ marginBottom: 20 }}>
                {criteria.map((c, i) => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{i + 1}. {c.name} <span style={{ color: 'var(--ou-blue-mid)', fontWeight: 700 }}>(Trọng số: {c.maxScore}%)</span></div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.description}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="number" min={0} max={10} step={0.1}
                        value={scores[c.id] ?? ''}
                        onChange={e => handleScoreChange(c.id, e.target.value)}
                        disabled={disableEdit}
                        className="form-input"
                        style={{ width: 72, textAlign: 'center', fontWeight: 700, background: disableEdit ? '#F3F4F6' : '#fff' }}
                      />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ 10</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'linear-gradient(135deg, var(--ou-blue-dark), var(--ou-blue-mid))', borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Tổng điểm (đã nhân trọng số)</div>
                <div style={{ color: '#fff', fontSize: 28, fontWeight: 800 }}>{totalScore.toFixed(1)} <span style={{ fontSize: 16, opacity: 0.7 }}>/ 10</span></div>
              </div>
              {!disableEdit && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>Lưu nháp</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleConfirm} disabled={saving}>Xác nhận điểm</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Advisor Tab ───────────────────────────────────────────────────
function AdvisorTab() {
  const { user } = useAuth();
  const toast = useToast();
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await thesisService.getByLecturer(user.id);
        setTheses(Array.isArray(data) ? data.filter(t => t.advisors?.some(a => a.id === user.id)) : []);
      } catch (e) {
        toast.error('Không thể tải dữ liệu: ' + e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user.id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Đang tải...</div>;

  return (
    <div className="card">
      <div className="card-header"><div className="card-title">Khoá luận tôi đang hướng dẫn</div></div>
      <div className="card-body" style={{ padding: 0 }}>
        <table className="ou-table">
          <thead><tr><th>Mã KL</th><th>Tên khoá luận</th><th>Sinh viên</th><th>Trạng thái</th></tr></thead>
          <tbody>
            {theses.map(t => (
              <tr key={t.id}>
                <td><span className="badge badge-blue">{t.code || `KL-${t.id}`}</span></td>
                <td style={{ fontWeight: 500 }}>{t.title}</td>
                <td style={{ fontSize: 12 }}>{t.students?.map(s => s.name).join(', ')}</td>
                <td><span className={`badge ${t.status === 'COMPLETED' ? 'badge-green' : 'badge-purple'}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────
function GiangvienOverview() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ grading: 0, advising: 0 });

  useEffect(() => {
    (async () => {
      try {
        const data = await thesisService.getByLecturer(user.id);
        const list = Array.isArray(data) ? data : [];
        setCounts({
          grading: list.filter(t => t.councilStatus != null && t.councilStatus !== 'LOCKED').length,
          advising: list.filter(t => t.advisors?.some(a => a.id === user.id)).length,
        });
      } catch (e) {
        toast.error('Không thể tải: ' + e);
      }
    })();
  }, [user.id]);

  return (
    <div>
      <div className="grid-2 mb-20">
        <div className="card" onClick={() => navigate('/giangvien/grading')} style={{ cursor: 'pointer' }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PenLine color="#0072CC" /></div>
            <div><div style={{ fontSize: 26, fontWeight: 800, color: '#0072CC' }}>{counts.grading}</div><div style={{ fontSize: 13 }}>KL cần chấm điểm</div></div>
          </div>
        </div>
        <div className="card" onClick={() => navigate('/giangvien/advisor')} style={{ cursor: 'pointer' }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen color="#059669" /></div>
            <div><div style={{ fontSize: 26, fontWeight: 800, color: '#059669' }}>{counts.advising}</div><div style={{ fontSize: 13 }}>KL đang hướng dẫn</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────
function GiangvienDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const tabs = [
    { path: '/giangvien', label: 'Tổng quan', exact: true },
    { path: '/giangvien/grading', label: 'Chấm điểm' },
    { path: '/giangvien/advisor', label: 'KL Hướng dẫn' },
  ];
  const isActive = (tab) => tab.exact ? location.pathname === tab.path : location.pathname.startsWith(tab.path);
  const activeTab = tabs.find(t => isActive(t));

  return (
    <MainLayout pageTitle={activeTab?.label || 'Giảng viên'} breadcrumb={`Giảng viên / ${activeTab?.label || ''}`}>
      <div className="tab-bar mb-20">
        {tabs.map(t => (
          <button key={t.path} className={`tab-btn ${isActive(t) ? 'active' : ''}`} onClick={() => navigate(t.path)}>{t.label}</button>
        ))}
      </div>
      <Routes>
        <Route index element={<GiangvienOverview />} />
        <Route path="grading" element={<GradingTab />} />
        <Route path="advisor" element={<AdvisorTab />} />
      </Routes>
    </MainLayout>
  );
}

export default GiangvienDashboard;