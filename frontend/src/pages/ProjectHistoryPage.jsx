import React, { useEffect, useState } from 'react';
import API from '../api/axiosInstance';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { Link } from 'react-router-dom';

export default function ProjectHistoryPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('ALL');
  const [search, setSearch]     = useState('');

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userId = user.userId || user.id;

  useEffect(() => {
    API.get(`/projects/my-projects?clientId=${userId}`)
      .then(r => setProjects(Array.isArray(r.data) ? r.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const filtered = projects.filter(p => {
    const matchTab = tab === 'ALL' ||
      (tab === 'COMPLETED' && p.status === 'COMPLETED') ||
      (tab === 'ACTIVE' && (p.status === 'OPEN' || p.status === 'IN_PROGRESS')) ||
      (tab === 'CLOSED' && p.status === 'CLOSED');
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', width: '100%' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        .hist-card{animation:fadeUp 0.35s ease both;transition:all 0.2s ease !important;}
        .hist-card:hover{transform:translateY(-2px) !important;border-color:rgba(124,58,237,0.4) !important;}
        .tab-btn{padding:8px 16px;border-radius:8px;border:1.5px solid;font-size:13px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif;transition:all 0.15s;}
        .skeleton{background:linear-gradient(90deg,#13141C 25%,#1A1B26 50%,#13141C 75%);background-size:600px 100%;animation:shimmer 1.4s infinite;border-radius:16px;}
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={s.pageTitle}>Project History</h1>
        <p style={s.pageSub}>Complete archive of all active, completed, and closed projects posted by you</p>
      </div>

      {/* Toolbar & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            ['ALL', '📋 All Projects (' + projects.length + ')'],
            ['ACTIVE', '⚡ Active (' + projects.filter(p => p.status === 'OPEN' || p.status === 'IN_PROGRESS').length + ')'],
            ['COMPLETED', '✅ Completed (' + projects.filter(p => p.status === 'COMPLETED').length + ')'],
          ].map(([val, label]) => (
            <button
              key={val}
              className="tab-btn"
              onClick={() => setTab(val)}
              style={{
                background: tab === val ? 'rgba(124,58,237,0.15)' : '#13141C',
                color: tab === val ? '#A855F7' : '#6B7280',
                borderColor: tab === val ? '#7C3AED' : '#2D2D3F',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={s.searchWrap}>
          <span style={{ color: '#6B7280' }}>🔍</span>
          <input
            placeholder="Filter project history..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={s.searchInput}
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '100px' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card padding="60px" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📜</div>
          <h3 style={{ color: '#F9FAFB', margin: '0 0 8px' }}>No projects in history</h3>
          <p style={{ color: '#6B7280', margin: 0 }}>No projects match the selected tab filter.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(p => (
            <div key={p.id} className="hist-card" style={s.rowCard}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h3 style={s.rowTitle}>{p.title}</h3>
                  <Badge color={p.status === 'COMPLETED' ? 'green' : p.status === 'OPEN' ? 'blue' : 'gray'}>
                    {p.status}
                  </Badge>
                </div>
                <p style={s.rowMeta}>
                  {p.category || 'General'} · Posted: {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent'} · Type: {p.projectType}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#34D399' }}>₹{p.budget}</span>
                <Link to={`/manage-applicants/${p.id}`} style={s.viewBtn}>
                  View Details →
                </Link>
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
  searchWrap: { display: 'flex', alignItems: 'center', gap: '8px', background: '#13141C', border: '1.5px solid #2D2D3F', borderRadius: '10px', padding: '8px 14px', width: '260px' },
  searchInput: { border: 'none', outline: 'none', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#F9FAFB', width: '100%', background: 'transparent' },
  rowCard: { background: '#13141C', border: '1px solid #2D2D3F', borderRadius: '14px', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  rowTitle: { fontSize: '16px', fontWeight: 700, color: '#F9FAFB', margin: 0 },
  rowMeta: { fontSize: '13px', color: '#6B7280', margin: '4px 0 0' },
  viewBtn: { padding: '8px 16px', background: 'rgba(124,58,237,0.1)', color: '#A855F7', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' },
};
