import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const CLIENT_LINKS = [
  { to: '/dashboard',           icon: '⊞',  label: 'Dashboard'       },
  { to: '/my-projects',         icon: '📋',  label: 'My Projects'     },
  { to: '/project-history',     icon: '📜',  label: 'Project History' },
  { to: '/create-project',      icon: '✚',  label: 'Post a Project'   },
  { to: '/manage-applicants',   icon: '👥',  label: 'Applicants'      },
  { to: '/team',                icon: '🤝',  label: 'My Team'         },
  { to: '/kanban',              icon: '📌',  label: 'Task Board'      },
  { to: '/profile',             icon: '👤',  label: 'Profile'         },
];

const FREELANCER_LINKS = [
  { to: '/dashboard',  icon: '⊞',  label: 'Dashboard'     },
  { to: '/projects',   icon: '🔍',  label: 'Find Projects' },
  { to: '/team',       icon: '🤝',  label: 'My Team'       },
  { to: '/kanban',     icon: '📌',  label: 'Task Board'    },
  { to: '/profile',    icon: '👤',  label: 'Profile'       },
];

const ADMIN_LINKS = [
  { to: '/admin/users',       icon: '👥', label: 'Manage users' },
  { to: '/admin/projects',    icon: '📋', label: 'Manage projects' },
  { to: '/admin/categories',  icon: '📑', label: 'Manage categories' },
  { to: '/admin/reports',     icon: '📊', label: 'View reports' },
  { to: '/admin/activity',    icon: '⚡', label: 'Monitor platform activity' },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  
  const links = user.role === 'ROLE_ADMIN' ? ADMIN_LINKS 
              : user.role === 'ROLE_CLIENT' ? CLIENT_LINKS 
              : FREELANCER_LINKS;
  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user.email?.split('@')[0] || 'User';
  const initials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '') || user.email?.[0]?.toUpperCase() || 'U';

  const roleLabel = user.role === 'ROLE_ADMIN' ? 'Admin' : user.role === 'ROLE_CLIENT' ? 'Client' : 'Freelancer';
  const roleColor = user.role === 'ROLE_ADMIN' ? '#EF4444' : user.role === 'ROLE_CLIENT' ? '#10B981' : '#7C3AED';

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  const Inner = () => (
    <div style={s.sidebar}>
      <style>{`
        @keyframes slideIn {
          from { opacity:0; transform:translateX(-8px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .nav-item { animation: slideIn 0.3s ease both; }
        .nav-item:nth-child(1){animation-delay:.02s}
        .nav-item:nth-child(2){animation-delay:.05s}
        .nav-item:nth-child(3){animation-delay:.08s}
        .nav-item:nth-child(4){animation-delay:.08s}
        .nav-item:nth-child(5){animation-delay:.11s}
        .nav-item:nth-child(6){animation-delay:.14s}
        .nav-item:nth-child(7){animation-delay:.17s}
        .nav-item:nth-child(8){animation-delay:.20s}
        .nav-link-dark {
          display:flex; align-items:center; gap:12px;
          padding:10px 12px; border-radius:10px;
          font-size:13.5px; font-weight:500;
          text-decoration:none; color:#9CA3AF;
          transition:all 0.18s ease;
          border-left:2px solid transparent;
          position:relative;
          margin-bottom:2px;
        }
        .nav-link-dark:hover {
          background: rgba(124,58,237,0.08);
          color: #E5E7EB;
        }
        .nav-link-dark.active {
          background: rgba(124,58,237,0.15);
          color: #A855F7;
          border-left-color: #7C3AED;
          font-weight:600;
        }
        .sidebar-tooltip {
          position:absolute; left:58px; top:50%; transform:translateY(-50%);
          background:#1A1B26; color:#F9FAFB; font-size:12px; font-weight:600;
          padding:6px 12px; border-radius:8px; white-space:nowrap; opacity:0;
          border:1px solid #2D2D3F; z-index:9999; transition:opacity 0.15s ease;
          box-shadow:0 4px 16px rgba(0,0,0,0.5); pointer-events:none;
        }
        .nav-item:hover .sidebar-tooltip { opacity:1; }
        .collapse-btn:hover { background:#1A1B26 !important; color:#A855F7 !important; }
        .logout-btn:hover { background:rgba(239,68,68,0.1) !important; color:#F87171 !important; }
        .sidebar-user-row { transition: all 0.2s ease !important; cursor: pointer !important; }
        .sidebar-user-row:hover { background: rgba(124,58,237,0.12) !important; }
      `}</style>

      {/* Brand */}
      <div style={s.brand}>
        {!collapsed && (
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={s.logoBox}>🚀</div>
            <span style={s.logoText}>Collab<span style={{ color:'#7C3AED' }}>Lance</span></span>
          </div>
        )}
        {collapsed && <div style={{ ...s.logoBox, margin:'0 auto' }}>🚀</div>}
        {!collapsed && (
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(true)}
            style={s.collapseBtn}
          >‹</button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div style={{ padding:'8px', borderBottom:'1px solid #2D2D3F' }}>
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(false)}
            style={{ ...s.collapseBtn, margin:'0 auto', display:'flex' }}
          >›</button>
        </div>
      )}

      {/* Nav */}
      <nav style={s.nav}>
        {!collapsed && (
          <p style={{ fontSize:'10px', fontWeight:700, color:'#6B7280', letterSpacing:'1px', textTransform:'uppercase', padding:'0 12px', marginBottom:'8px' }}>
            NAVIGATION
          </p>
        )}
        {links.map((link, i) => (
          <div key={link.to} className="nav-item" style={{ position:'relative' }}>
            <NavLink
              to={link.to}
              className={({ isActive }) => `nav-link-dark${isActive ? ' active' : ''}`}
              style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '12px 0' : '10px 12px' }}
              onClick={() => setMobileOpen && setMobileOpen(false)}
            >
              <span style={{ fontSize:'17px', flexShrink:0 }}>{link.icon}</span>
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
            {collapsed && <span className="sidebar-tooltip">{link.label}</span>}
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={s.bottom}>
        <div
          className="sidebar-user-row"
          onClick={() => { navigate('/profile'); setMobileOpen && setMobileOpen(false); }}
          title="View My Profile"
          style={{ ...s.userRow, justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <div style={s.avatar}>{initials.toUpperCase()}</div>
          {!collapsed && (
            <div style={{ overflow:'hidden', flex:1 }}>
              <p style={s.userName}>{displayName}</p>
              <span style={{ ...s.roleBadge, background: roleColor + '20', color: roleColor }}>
                {roleLabel}
              </span>
            </div>
          )}
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
          style={{
            ...s.logoutBtn,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '10px 0' : '10px 12px',
          }}
        >
          <span style={{ fontSize:'16px' }}>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div
        className="desktop-sidebar"
        style={{
          width: collapsed ? '72px' : '240px',
          flexShrink: 0,
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          zIndex: 100,
        }}
      >
        <Inner />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', zIndex:200 }}
          />
          <div style={{ position:'fixed', top:0, left:0, bottom:0, width:'260px', zIndex:201 }}>
            <Inner />
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 768px) { .desktop-sidebar { display:none !important; } }
      `}</style>
    </>
  );
}

const s = {
  sidebar: {
    height:'100vh', width:'100%',
    display:'flex', flexDirection:'column',
    background:'#090A0F',
    borderRight:'1px solid #2D2D3F',
    fontFamily:'Inter, sans-serif',
    position:'relative',
    overflow:'hidden',
  },
  brand: {
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'16px 12px', borderBottom:'1px solid #2D2D3F',
    minHeight:'62px', flexShrink:0,
  },
  logoBox: {
    width:'34px', height:'34px', borderRadius:'10px',
    background:'linear-gradient(135deg, #7C3AED, #6366F1)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'17px', flexShrink:0,
    boxShadow:'0 4px 12px rgba(124,58,237,0.4)',
  },
  logoText: { fontSize:'16px', fontWeight:800, color:'#F9FAFB', letterSpacing:'-0.3px' },
  collapseBtn: {
    background:'#13141C', border:'1px solid #2D2D3F',
    borderRadius:'8px', width:'28px', height:'28px',
    display:'flex', alignItems:'center', justifyContent:'center',
    color:'#6B7280', cursor:'pointer', fontSize:'16px',
    fontWeight:700, transition:'all 0.2s', flexShrink:0,
    fontFamily:'Inter, sans-serif',
  },
  nav: { flex:1, overflowY:'auto', padding:'12px 8px' },
  bottom: {
    borderTop:'1px solid #2D2D3F',
    padding:'10px 8px', flexShrink:0,
  },
  userRow: {
    display:'flex', alignItems:'center', gap:'10px',
    padding:'8px', borderRadius:'10px',
    marginBottom:'4px',
  },
  avatar: {
    width:'34px', height:'34px', borderRadius:'50%', flexShrink:0,
    background:'linear-gradient(135deg, #7C3AED, #6366F1)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'12px', fontWeight:700, color:'#fff',
    boxShadow:'0 2px 8px rgba(124,58,237,0.4)',
  },
  userName: {
    margin:0, fontSize:'13px', fontWeight:600, color:'#F9FAFB',
    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
  },
  roleBadge: {
    fontSize:'10px', fontWeight:700,
    padding:'2px 8px', borderRadius:'20px',
    display:'inline-block', marginTop:'2px',
  },
  logoutBtn: {
    display:'flex', alignItems:'center', gap:'10px', width:'100%',
    padding:'10px 12px', borderRadius:'10px', border:'none',
    background:'transparent', color:'#6B7280',
    fontSize:'13px', fontWeight:500, cursor:'pointer',
    transition:'all 0.2s', fontFamily:'Inter, sans-serif',
  },
};