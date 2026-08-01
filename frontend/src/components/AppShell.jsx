import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import API from '../api/axiosInstance';

const PAGE_TITLES = {
  '/dashboard':         'Dashboard',
  '/projects':          'Projects',
  '/create-project':    'Post a Project',
  '/profile':           'My Profile',
  '/team':              'My Team',
  '/kanban':            'Task Board',
  '/chat':              'Team Chat',
  '/manage-applicants': 'Manage Applicants',
};

export default function AppShell({ children }) {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // User Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubject, setReportSubject]     = useState('');
  const [reportDesc, setReportDesc]           = useState('');
  const [reportLoading, setReportLoading]     = useState(false);
  const [reportSuccess, setReportSuccess]     = useState('');
  const [reportError, setReportError]         = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const token = sessionStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const displayName = user.firstName || user.email?.split('@')[0] || 'User';
  const initials = (user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase();

  const sidebarWidth = collapsed ? 72 : 240;
  const title = Object.entries(PAGE_TITLES).find(([k]) => location.pathname.startsWith(k))?.[1] || 'CollabLance';

  const handleSendReport = async (e) => {
    e.preventDefault();
    if (!reportSubject.trim() || !reportDesc.trim()) return;
    setReportLoading(true);
    setReportSuccess('');
    setReportError('');
    try {
      await API.post('/reports/submit', {
        subject: reportSubject.trim(),
        description: reportDesc.trim(),
        email: user.email,
        role: user.role
      });
      setReportSuccess('Your issue report has been submitted to the Admin!');
      setReportSubject('');
      setReportDesc('');
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess('');
      }, 2000);
    } catch (err) {
      setReportError(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div style={s.shell}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes headerSlide { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes contentFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .app-header { animation: headerSlide 0.3s ease both; }
        .app-content { animation: contentFade 0.35s ease 0.05s both; }
        .main-canvas { transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1) !important; }
        .hdr-btn:hover { background:#1A1B26 !important; border-color:#7C3AED !important; }
        .hdr-btn { transition: all 0.2s ease !important; }
        .user-chip { transition: all 0.2s ease !important; cursor: pointer !important; }
        .user-chip:hover { border-color: #7C3AED !important; background: rgba(124,58,237,0.15) !important; transform: translateY(-1px); }
        @media(max-width:768px){
          .main-canvas { margin-left:0 !important; width:100% !important; }
          .mobile-btn  { display:flex !important; }
        }
      `}</style>

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="main-canvas" style={{ ...s.canvas, marginLeft: sidebarWidth + 'px', width: `calc(100% - ${sidebarWidth}px)` }}>

        {/* Header */}
        <header className="app-header" style={s.header}>
          {/* Mobile hamburger */}
          <button
            className="mobile-btn hdr-btn"
            onClick={() => setMobileOpen(true)}
            style={{ ...s.hdrBtn, display:'none' }}
          >☰</button>

          {/* Page title */}
          <div style={s.pageTitle}>
            <span style={s.pageTitleDot} />
            {title}
          </div>

          {/* Right side */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            {user.role !== 'ROLE_ADMIN' && (
              <button
                className="hdr-btn"
                onClick={() => setShowReportModal(true)}
                style={{
                  ...s.hdrBtn, width: 'auto', padding: '0 12px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#F87171', fontSize: '13px', fontWeight: '600'
                }}
                title="Report an issue to platform admin"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                  <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
                Report Issue
              </button>
            )}

            <button className="hdr-btn" style={s.hdrBtn} title="Notifications">
              <span>🔔</span>
              <span style={s.notifDot} />
            </button>

            <div className="user-chip" style={s.userChip} onClick={() => navigate('/profile')} title="View My Profile">
              <div style={s.chipAvatar}>{initials}</div>
              <span style={s.chipName}>{displayName}</span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="app-content" style={s.main}>
          {children}
        </main>
      </div>

      {/* REPORT ISSUE MODAL */}
      {showReportModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#13141C', border: '1px solid #2D2D3F',
            borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#F9FAFB', fontSize: '18px', fontWeight: '700' }}>Report an Issue to Admin</h3>
              <button onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            {reportSuccess && (
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34D399', fontSize: '13px', marginBottom: '16px' }}>
                ✓ {reportSuccess}
              </div>
            )}
            {reportError && (
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171', fontSize: '13px', marginBottom: '16px' }}>
                ⚠️ {reportError}
              </div>
            )}

            <form onSubmit={handleSendReport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#9CA3AF', marginBottom: '6px' }}>Subject / Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Issue with milestone payment or project assignment"
                  value={reportSubject}
                  onChange={e => setReportSubject(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #374151', background: '#0D0E15', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#9CA3AF', marginBottom: '6px' }}>Detailed Description</label>
                <textarea
                  rows="4"
                  placeholder="Describe what happened and any details for the admin..."
                  value={reportDesc}
                  onChange={e => setReportDesc(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #374151', background: '#0D0E15', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #374151', background: 'transparent', color: '#9CA3AF', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportLoading}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #7C3AED, #6366F1)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '700', opacity: reportLoading ? 0.7 : 1 }}
                >
                  {reportLoading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  shell: {
    display:'flex',
    width:'100%',
    minHeight:'100vh',
    background:'#090A0F',
    fontFamily:'Inter, sans-serif',
    position:'relative',
    overflowX:'hidden',
  },
  canvas: {
    flex:1,
    display:'flex',
    flexDirection:'column',
    minHeight:'100vh',
    maxWidth:'100%',
  },
  header: {
    position:'sticky', top:0, zIndex:50,
    background:'rgba(9,10,15,0.92)',
    backdropFilter:'blur(16px)',
    borderBottom:'1px solid #2D2D3F',
    padding:'0 28px', height:'62px',
    display:'flex', alignItems:'center', justifyContent:'space-between',
    gap:'16px', width:'100%', boxSizing:'border-box',
    boxShadow:'0 1px 0 rgba(124,58,237,0.08)',
  },
  pageTitle: {
    display:'flex', alignItems:'center', gap:'8px',
    fontSize:'15px', fontWeight:700, color:'#F9FAFB', flexShrink:0,
  },
  pageTitleDot: {
    width:'6px', height:'6px', borderRadius:'50%',
    background:'#7C3AED', display:'inline-block',
    boxShadow:'0 0 8px rgba(124,58,237,0.6)',
  },

  hdrBtn: {
    position:'relative', background:'#13141C',
    border:'1px solid #2D2D3F', borderRadius:'10px',
    width:'38px', height:'38px',
    display:'flex', alignItems:'center', justifyContent:'center',
    cursor:'pointer', fontSize:'16px',
  },
  notifDot: {
    position:'absolute', top:'8px', right:'8px',
    width:'7px', height:'7px', borderRadius:'50%',
    background:'#7C3AED', border:'2px solid #090A0F',
    boxShadow:'0 0 6px rgba(124,58,237,0.6)',
  },
  userChip: {
    display:'flex', alignItems:'center', gap:'8px',
    background:'#13141C', border:'1px solid #2D2D3F',
    borderRadius:'10px', padding:'5px 12px 5px 5px',
    cursor:'pointer',
  },
  chipAvatar: {
    width:'28px', height:'28px', borderRadius:'8px',
    background:'linear-gradient(135deg, #7C3AED, #6366F1)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'12px', fontWeight:700, color:'#fff',
  },
  chipName: { fontSize:'13px', fontWeight:600, color:'#E5E7EB' },
  main: {
    flex:1,
    padding:'28px 36px',
    background:'#090A0F',
    width:'100%',
    boxSizing:'border-box',
  },
};