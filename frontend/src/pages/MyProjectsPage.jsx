import React, { useEffect, useState } from 'react';
import API from '../api/axiosInstance';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

export default function MyProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [toast, setToast]       = useState('');

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const rawId = user.userId || user.id;
  const userId = rawId ? parseInt(rawId) : null;

  useEffect(() => {
    fetchMyActiveProjects();
  }, [userId]);

  const fetchMyActiveProjects = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let list = [];

      // 1. Primary: /projects/my-projects?clientId=${userId}
      try {
        const res = await API.get(`/projects/my-projects?clientId=${userId}`);
        if (Array.isArray(res.data) && res.data.length > 0) {
          list = res.data;
        }
      } catch { /* fallback to tier 2 */ }

      // 2. Secondary: /projects/client/${userId}
      if (list.length === 0) {
        try {
          const fallbackRes = await API.get(`/projects/client/${userId}`);
          if (Array.isArray(fallbackRes.data) && fallbackRes.data.length > 0) {
            list = fallbackRes.data;
          }
        } catch { /* fallback to tier 3 */ }
      }

      // 3. Tertiary: Fetch all projects and filter by clientId
      if (list.length === 0) {
        try {
          const allRes = await API.get('/projects');
          if (Array.isArray(allRes.data)) {
            list = allRes.data.filter(p => String(p.clientId) === String(userId));
          }
        } catch { /* ignore */ }
      }

      // Filter for active projects (OPEN, IN_PROGRESS, or null/unspecified status)
      const active = list.filter(p => !p.status || p.status === 'OPEN' || p.status === 'IN_PROGRESS');
      setProjects(active);
    } catch (err) {
      console.error('Error fetching my projects:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const handleMarkCompleted = async (projectId) => {
    try {
      await API.put(`/projects/${projectId}/status?status=COMPLETED`);
      showToast('✅ Project marked as COMPLETED!');
      fetchMyActiveProjects();
    } catch {
      showToast('❌ Failed to update project status.');
    }
  };

  const filtered = projects.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', width: '100%' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        .my-proj-card{animation:fadeUp 0.35s ease both;transition:all 0.2s ease !important;}
        .my-proj-card:hover{transform:translateY(-3px) !important;border-color:rgba(124,58,237,0.4) !important;box-shadow:0 12px 32px rgba(0,0,0,0.4) !important;}
        .action-btn:hover{background:rgba(124,58,237,0.2) !important;color:#A855F7 !important;border-color:#7C3AED !important;}
        .skeleton{background:linear-gradient(90deg,#13141C 25%,#1A1B26 50%,#13141C 75%);background-size:600px 100%;animation:shimmer 1.6s infinite;border-radius:16px;}
        .toast-n{position:fixed;top:80px;right:24px;z-index:9999;background:#1A1B26;border:1px solid #2D2D3F;color:#F9FAFB;padding:14px 22px;border-radius:12px;font-size:14px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
        .refresh-btn:hover{background:rgba(124,58,237,0.15) !important;color:#A855F7 !important;}
      `}</style>

      {toast && <div className="toast-n">{toast}</div>}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={s.pageTitle}>My Active Projects</h1>
          <p style={s.pageSub}>Projects posted by you that are currently active</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchMyActiveProjects}
            className="refresh-btn"
            style={s.refreshBtn}
          >
            🔄 Refresh
          </button>
          <Link to="/create-project" style={s.postBtn}>✚ Post New Project</Link>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <div style={s.searchWrap}>
          <span style={{ color: '#6B7280' }}>🔍</span>
          <input
            placeholder="Search your active projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={s.searchInput}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={s.grid}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '260px' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card padding="60px" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
          <h3 style={{ color: '#F9FAFB', margin: '0 0 8px' }}>No active projects found</h3>
          <p style={{ color: '#6B7280', margin: '0 0 20px' }}>You haven't posted any active projects yet.</p>
          <Link to="/create-project" style={s.postBtn}>✚ Post a Project</Link>
        </Card>
      ) : (
        <div style={s.grid}>
          {filtered.map(p => (
            <div key={p.id} className="my-proj-card" style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Badge color={p.projectType === 'TEAM' ? 'purple' : 'blue'}>
                  {p.projectType === 'TEAM' ? '👥 Team Project' : '👤 Individual Job'}
                </Badge>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#34D399' }}>₹{p.budget}</span>
              </div>

              <h3 style={s.cardTitle}>{p.title}</h3>
              <p style={s.cardSub}>{p.category || 'General'} · Deadline: {p.deadline || 'Flexible'}</p>
              <p style={s.cardDesc}>{p.description}</p>

              {/* Roles Summary for Team */}
              {p.projectType === 'TEAM' && p.roleRequirements?.length > 0 && (
                <div style={s.rolesBox}>
                  {p.roleRequirements.map(r => (
                    <span key={r.id} style={s.roleChip}>
                      {r.roleName}: {r.filledSlots}/{r.totalSlots} Hired
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={s.cardFooter}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Link to={`/manage-applicants/${p.id}`} className="action-btn" style={s.actBtn}>
                    👥 Applicants
                  </Link>
                  <Link to={`/team/${p.id}`} className="action-btn" style={s.actBtn}>
                    🤝 Team
                  </Link>
                  <Link to={`/chat/${p.id}`} className="action-btn" style={s.actBtn}>
                    💬 Chat
                  </Link>
                  <Link to={`/kanban/${p.id}`} className="action-btn" style={s.actBtn}>
                    📌 Board
                  </Link>
                </div>
                <button
                  onClick={() => handleMarkCompleted(p.id)}
                  style={s.completeBtn}
                  title="Mark project as completed"
                >
                  ✓ Complete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  pageTitle: { fontSize: '26px', fontWeight: 800, color: '#F9FAFB', margin: '0 0 4px', letterSpacing: '-0.3px' },
  pageSub: { fontSize: '14px', color: '#6B7280', margin: 0 },
  postBtn: { padding: '11px 22px', background: 'linear-gradient(135deg,#7C3AED,#6366F1)', color: '#F9FAFB', borderRadius: '10px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' },
  refreshBtn: { padding: '11px 18px', background: '#13141C', border: '1px solid #2D2D3F', color: '#9CA3AF', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: '8px', background: '#13141C', border: '1.5px solid #2D2D3F', borderRadius: '10px', padding: '9px 14px', flex: 1 },
  searchInput: { border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#F9FAFB', width: '100%', background: 'transparent' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '20px' },
  card: { background: '#13141C', borderRadius: '16px', padding: '22px', border: '1px solid #2D2D3F', display: 'flex', flexDirection: 'column', gap: '10px' },
  cardTitle: { fontSize: '16px', fontWeight: 700, color: '#F9FAFB', margin: 0 },
  cardSub: { fontSize: '12px', color: '#6B7280', margin: 0 },
  cardDesc: { fontSize: '13px', color: '#9CA3AF', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  rolesBox: { display: 'flex', flexWrap: 'wrap', gap: '6px', background: '#0D0E15', padding: '10px', borderRadius: '10px', border: '1px solid #2D2D3F' },
  roleChip: { fontSize: '11px', fontWeight: 600, color: '#A855F7', background: 'rgba(124,58,237,0.1)', padding: '3px 8px', borderRadius: '6px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #2D2D3F', marginTop: 'auto' },
  actBtn: { padding: '6px 12px', background: '#0D0E15', color: '#9CA3AF', border: '1px solid #2D2D3F', borderRadius: '8px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' },
  completeBtn: { padding: '6px 14px', background: 'rgba(16,185,129,0.15)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
};
