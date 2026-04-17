import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { thesisService } from '../../services/thesisService';
import { scoreService } from '../../services/scoreService';

const STATUS_STEPS = ['Đăng ký đề tài', 'GVHD xác nhận', 'Phân công phản biện', 'Thành lập hội đồng', 'Bảo vệ & Chấm điểm', 'Công bố kết quả'];

function ThesisInfo({ thesis }) {
  if (!thesis) return null;
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Thông tin Khoá luận</div>
        <span className={`badge ${thesis.status === 'COMPLETED' ? 'badge-green' : 'badge-blue'}`}>
          {thesis.status === 'COMPLETED' ? '✅ Hoàn thành' : '⏳ Đang thực hiện'}
        </span>
      </div>
      <div className="card-body">
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{thesis.title}</div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Mã KL:</span> <span style={{ fontWeight: 600 }}>{thesis.code || `KL-${thesis.id}`}</span></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Ngành:</span> <span style={{ fontWeight: 600 }}>{thesis.major || 'Chưa cập nhật'}</span></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Năm học:</span> <span style={{ fontWeight: 600 }}>{thesis.year || '-'}</span></div>
            <div><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Hội đồng:</span> <span style={{ fontWeight: 600 }}>{thesis.councilName || 'Chưa phân công'}</span></div>
          </div>
        </div>

        <div className="grid-2">
          <div>
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>👨‍🏫 Giảng viên hướng dẫn</div>
            {(thesis.advisors || []).map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ou-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>
                  {a.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.email}</div>
                </div>
              </div>
            ))}
            {(!thesis.advisors || thesis.advisors.length === 0) && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Chưa có</div>}
          </div>

          <div>
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>🔎 Giảng viên phản biện</div>
            {thesis.reviewer ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>
                  {thesis.reviewer.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{thesis.reviewer.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{thesis.reviewer.email}</div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Chưa phân công</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreView({ thesis }) {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!thesis) { setLoading(false); return; }
    (async () => {
      try {
        const data = await scoreService.getSummary(thesis.id);
        setSummary(data);
      } catch (e) {
        if (!String(e).includes('404')) toast.error('Không thể tải điểm: ' + e);
      } finally {
        setLoading(false);
      }
    })();
  }, [thesis?.id]);

  if (!thesis) return (
    <div className="card"><div className="card-body" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Chưa có khoá luận</div></div>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Đang tải điểm...</div>;

  const isLocked = thesis.councilStatus === 'LOCKED';

  return (
    <div>
      {!isLocked ? (
        <div style={{ background: '#FFF7E6', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 32 }}>⏳</div>
          <div>
            <div style={{ fontWeight: 700, color: '#92400E' }}>Hội đồng chưa khoá điểm</div>
            <div style={{ fontSize: 13, color: '#92400E', opacity: 0.8 }}>Điểm chính thức sẽ được công bố sau khi Giáo vụ khoá hội đồng. Bạn cũng sẽ nhận email thông báo.</div>
          </div>
        </div>
      ) : summary ? (
        <div>
          {/* Điểm trung bình chính thức */}
          <div style={{ background: 'linear-gradient(135deg, var(--ou-blue-dark), var(--ou-blue-mid))', borderRadius: 16, padding: '28px 32px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 4 }}>Điểm trung bình chính thức</div>
              <div style={{ color: '#fff', fontSize: 48, fontWeight: 800, lineHeight: 1 }}>
                {summary.avgScore?.toFixed(1)}
                <span style={{ fontSize: 20, opacity: 0.7 }}>/10</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 40 }}>🎓</div>
              <div style={{ color: '#FFC72C', fontWeight: 700, fontSize: 14, marginTop: 4 }}>
                {summary.avgScore >= 9 ? 'XUẤT SẮC' : summary.avgScore >= 8 ? 'GIỎI' : summary.avgScore >= 7 ? 'KHÁ' : summary.avgScore >= 5 ? 'TRUNG BÌNH' : 'KHÔNG ĐẠT'}
              </div>
            </div>
          </div>

          {/* Điểm từng giảng viên */}
          <div className="card">
            <div className="card-header"><div className="card-title">Điểm từng thành viên hội đồng</div></div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="ou-table">
                <thead>
                  <tr>
                    <th>Giảng viên</th>
                    <th>Vai trò</th>
                    {(summary.criteria || []).map(c => <th key={c.id}>{c.name}</th>)}
                    <th>Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary.memberScores || []).map(m => (
                    <tr key={m.lecturerId}>
                      <td style={{ fontWeight: 600 }}>{m.lecturerName}</td>
                      <td><span className="badge badge-blue">{m.councilRole}</span></td>
                      {(summary.criteria || []).map(c => (
                        <td key={c.id} style={{ textAlign: 'center' }}>
                          {m.details?.find(d => d.criteriaId === c.id)?.score ?? '-'}
                        </td>
                      ))}
                      <td style={{ fontWeight: 700, color: 'var(--ou-blue)' }}>{m.total?.toFixed(1) ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: '#F3F4F6', borderRadius: 12, padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Chưa có thông tin điểm
        </div>
      )}
    </div>
  );
}

function ProgressTimeline({ thesis }) {
  if (!thesis) return null;

  const currentStep = thesis.status === 'COMPLETED' ? 5
    : thesis.councilStatus === 'LOCKED' ? 5
    : thesis.councilName ? 4
    : thesis.reviewer ? 2
    : thesis.advisors?.length ? 1
    : 0;

  return (
    <div className="card">
      <div className="card-header"><div className="card-title">Tiến trình Khoá luận</div></div>
      <div className="card-body">
        {STATUS_STEPS.map((step, i) => (
          <div key={step} style={{ display: 'flex', gap: 14, marginBottom: i < STATUS_STEPS.length - 1 ? 4 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: i < currentStep ? 'var(--success)' : i === currentStep ? 'var(--ou-blue)' : 'var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: i <= currentStep ? '#fff' : 'var(--text-muted)',
                fontSize: 13, fontWeight: 700,
              }}>
                {i < currentStep ? '✓' : i + 1}
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 24, background: i < currentStep ? 'var(--success)' : 'var(--border)', margin: '3px 0' }} />
              )}
            </div>
            <div style={{ paddingBottom: i < STATUS_STEPS.length - 1 ? 20 : 0, paddingTop: 4 }}>
              <div style={{ fontWeight: i === currentStep ? 700 : 500, color: i <= currentStep ? 'var(--text)' : 'var(--text-muted)', fontSize: 13.5 }}>
                {step}
              </div>
              {i === currentStep && (
                <div style={{ fontSize: 12, color: 'var(--ou-blue)', marginTop: 2 }}>● Đang ở bước này</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SinhvienDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [thesis, setThesis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await thesisService.getByStudent(user.id);
        setThesis(Array.isArray(data) ? data[0] : data);
      } catch (e) {
        if (!String(e).includes('404')) toast.error('Không thể tải khoá luận: ' + e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user.id]);

  const tabs = [
    { path: '/sinhvien', label: '📊 Tổng quan', exact: true },
    { path: '/sinhvien/thesis', label: '📖 Khoá luận' },
    { path: '/sinhvien/scores', label: '🎯 Điểm số' },
  ];
  const isActive = (tab) => tab.exact ? location.pathname === tab.path : location.pathname.startsWith(tab.path);
  const activeTab = tabs.find(t => isActive(t));

  if (loading) return (
    <MainLayout pageTitle="Tổng quan">
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Đang tải...</div>
    </MainLayout>
  );

  return (
    <MainLayout pageTitle={activeTab?.label?.replace(/^[\S]+ /, '') || 'Sinh viên'} breadcrumb={`Sinh viên / ${activeTab?.label?.replace(/^[\S]+ /, '') || ''}`}>
      <div className="tab-bar mb-20">
        {tabs.map(t => (
          <button key={t.path} className={`tab-btn ${isActive(t) ? 'active' : ''}`} onClick={() => navigate(t.path)}>
            {t.label}
          </button>
        ))}
      </div>

      <Routes>
        <Route index element={
          thesis ? (
            <div className="grid-2" style={{ alignItems: 'flex-start' }}>
              <div>
                <ThesisInfo thesis={thesis} />
              </div>
              <ProgressTimeline thesis={thesis} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Bạn chưa có khoá luận</div>
              <div style={{ color: 'var(--text-muted)' }}>Liên hệ Giáo vụ khoa để được đăng ký khoá luận</div>
            </div>
          )
        } />
        <Route path="thesis" element={<ThesisInfo thesis={thesis} />} />
        <Route path="scores" element={<ScoreView thesis={thesis} />} />
      </Routes>
    </MainLayout>
  );
}

export default SinhvienDashboard;
