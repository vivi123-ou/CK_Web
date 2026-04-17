import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [theses, crits] = await Promise.all([
        thesisService.getByLecturer(user.id),
        criteriaService.getAll(),
      ]);
      const gradingList = (Array.isArray(theses) ? theses : []).filter(
        t => t.councilStatus !== 'LOCKED'
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
      } else {
        setScores({});
        setSavedScores({});
      }
    } catch {
      setScores({});
    }
  };

  const handleSelectThesis = (thesis) => {
    setSelectedThesis(thesis);
    loadExistingScores(thesis);
  };

  const handleScoreChange = (criteriaId, value) => {
    const crit = criteria.find(c => c.id === criteriaId);
    const max = crit?.maxScore || 10;
    const parsed = Math.min(Math.max(parseFloat(value) || 0, 0), max);
    setScores(prev => ({ ...prev, [criteriaId]: parsed }));
  };

  const totalScore = criteria.reduce((sum, c) => sum + (scores[c.id] || 0), 0);
  const maxTotal = criteria.reduce((sum, c) => sum + (c.maxScore || 0), 0);

  const handleSave = async () => {
    if (!selectedThesis) return;
    setSaving(true);
    try {
      const details = criteria.map(c => ({ criteriaId: c.id, score: scores[c.id] || 0 }));
      await scoreService.saveScore({
        thesisId: selectedThesis.id,
        lecturerId: user.id,
        details,
        total: totalScore,
      });
      setSavedScores({ ...scores });
      toast.success('Lưu điểm thành công');
    } catch (e) {
      toast.error('Lỗi lưu điểm: ' + e);
    } finally {
      setSaving(false);
    }
  };

  const isLocked = selectedThesis?.councilStatus === 'LOCKED';

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div>;

  return (
    <div className="grid-2" style={{ alignItems: 'flex-start' }}>
      {/* Danh sách khoá luận cần chấm */}
      <div className="card" style={{ marginBottom: 0 }}>
        <div className="card-header">
          <div className="card-title">Khoá luận cần chấm điểm</div>
          <span className="badge badge-blue">{assignments.length}</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {assignments.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
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
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                  SV: {t.students?.map(s => s.name).join(', ') || '-'} &nbsp;|&nbsp;
                  HĐ: {t.councilName || '-'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className={`badge ${t.councilStatus === 'LOCKED' ? 'badge-red' : 'badge-green'}`}>
                    {t.councilStatus === 'LOCKED' ? '🔒 Đã khoá' : '🟢 Đang mở'}
                  </span>
                  {t.myScore != null && (
                    <span className="badge badge-blue">Đã chấm: {t.myScore}/10</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Form chấm điểm */}
      <div>
        {!selectedThesis ? (
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-body" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Chọn khoá luận để chấm điểm</div>
              <div style={{ fontSize: 13 }}>Nhấn vào một khoá luận bên trái để bắt đầu nhập điểm</div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div>
                <div className="card-title">Chấm điểm Khoá luận</div>
                <div className="card-subtitle" style={{ maxWidth: 380 }}>{selectedThesis.title}</div>
              </div>
              {isLocked && <span className="badge badge-red">🔒 Hội đồng đã khoá</span>}
            </div>
            <div className="card-body">
              {isLocked && (
                <div style={{ background: '#FEE2E2', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#DC2626' }}>
                  ⚠️ Hội đồng đã bị khoá. Bạn không thể chỉnh sửa điểm.
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                {criteria.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
                    Giáo vụ chưa thiết lập tiêu chí chấm điểm
                  </div>
                ) : (
                  criteria.map((c, i) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{i + 1}. {c.name}</div>
                        {c.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.description}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="number"
                          min={0}
                          max={c.maxScore}
                          step={0.5}
                          value={scores[c.id] ?? ''}
                          onChange={e => handleScoreChange(c.id, e.target.value)}
                          disabled={isLocked}
                          style={{
                            width: 72,
                            padding: '7px 10px',
                            border: '1.5px solid var(--border)',
                            borderRadius: 8,
                            fontFamily: 'var(--font)',
                            fontSize: 14,
                            fontWeight: 700,
                            textAlign: 'center',
                            color: 'var(--ou-blue)',
                            background: isLocked ? '#F3F4F6' : '#fff',
                          }}
                        />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 40 }}>/ {c.maxScore}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Tổng điểm */}
              <div style={{ background: 'linear-gradient(135deg, var(--ou-blue-dark), var(--ou-blue-mid))', borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Tổng điểm của bạn</div>
                <div style={{ color: '#fff', fontSize: 28, fontWeight: 800 }}>
                  {totalScore.toFixed(1)} <span style={{ fontSize: 16, opacity: 0.7 }}>/ {maxTotal}</span>
                </div>
              </div>

              {!isLocked && criteria.length > 0 && (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: 15 }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? '⏳ Đang lưu...' : '💾 Lưu điểm'}
                </button>
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

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div>;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Khoá luận tôi đang hướng dẫn</div>
        <span className="badge badge-blue">{theses.length}</span>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        {theses.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có khoá luận nào được phân công hướng dẫn</div>
        ) : (
          <table className="ou-table">
            <thead>
              <tr>
                <th>Mã KL</th>
                <th>Tên khoá luận</th>
                <th>Sinh viên</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {theses.map(t => (
                <tr key={t.id}>
                  <td><span className="badge badge-blue">{t.code || `KL-${t.id}`}</span></td>
                  <td style={{ fontWeight: 500 }}>{t.title}</td>
                  <td style={{ fontSize: 12 }}>{t.students?.map(s => s.name).join(', ') || '-'}</td>
                  <td>
                    <span className={`badge ${t.status === 'COMPLETED' ? 'badge-green' : t.status === 'GRADING' ? 'badge-purple' : 'badge-blue'}`}>
                      {t.status === 'COMPLETED' ? 'Hoàn thành' : t.status === 'GRADING' ? 'Đang chấm' : 'Đang thực hiện'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────
function GiangvienOverview() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ grading: '-', advising: '-' });

  useEffect(() => {
    (async () => {
      try {
        const data = await thesisService.getByLecturer(user.id);
        const list = Array.isArray(data) ? data : [];
        setCounts({
          grading: list.filter(t => t.councilStatus !== 'LOCKED').length,
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
        {[
          { label: 'KL cần chấm điểm', value: counts.grading, icon: '✏️', color: '#005BAA', path: '/giangvien/grading' },
          { label: 'KL đang hướng dẫn', value: counts.advising, icon: '📚', color: '#10B981', path: '/giangvien/advisor' },
        ].map(c => (
          <div key={c.label} className="card" style={{ marginBottom: 0, cursor: 'pointer' }} onClick={() => navigate(c.path)}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 36, width: 60, height: 60, borderRadius: 14, background: c.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: '#EBF5FF', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ fontWeight: 700, color: 'var(--ou-blue)', marginBottom: 6 }}>📌 Lưu ý chấm điểm</div>
        <ul style={{ paddingLeft: 18, fontSize: 13.5, lineHeight: 1.9, color: 'var(--text)' }}>
          <li>Vào <strong>Chấm điểm</strong> để nhập điểm theo từng tiêu chí cho khoá luận được phân công</li>
          <li>Điểm sẽ không thể chỉnh sửa sau khi hội đồng bị khoá bởi Giáo vụ</li>
          <li>Hệ thống tự tính tổng điểm và điểm trung bình các thành viên hội đồng</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────
function GiangvienDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/giangvien', label: '📊 Tổng quan', exact: true },
    { path: '/giangvien/grading', label: '✏️ Chấm điểm' },
    { path: '/giangvien/advisor', label: '📚 KL Hướng dẫn' },
  ];

  const isActive = (tab) => tab.exact ? location.pathname === tab.path : location.pathname.startsWith(tab.path);
  const activeTab = tabs.find(t => isActive(t));

  return (
    <MainLayout pageTitle={activeTab?.label?.replace(/^[\S]+ /, '') || 'Giảng viên'} breadcrumb={`Giảng viên / ${activeTab?.label?.replace(/^[\S]+ /, '') || ''}`}>
      <div className="tab-bar mb-20">
        {tabs.map(t => (
          <button key={t.path} className={`tab-btn ${isActive(t) ? 'active' : ''}`} onClick={() => navigate(t.path)}>
            {t.label}
          </button>
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
