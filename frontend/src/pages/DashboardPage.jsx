import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axiosInstance';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

export default function DashboardPage() {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const isClient = user.role === 'ROLE_CLIENT';
  const displayName = user.firstName || user.email?.split('@')[0] || 'User';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [greeting, setGreeting] = useState('');
  
  // New state for dynamic stats
  const [appCount, setAppCount] = useState(0);
  const [freelancerCompRate, setFreelancerCompRate] = useState('0%');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
    
    const uId = user.userId || user.id;

    // IDOR Protection: Clients strictly fetch their own projects via /projects/my-projects
    const endpoint = isClient ? `/projects/my-projects?clientId=${uId}` : '/projects';
    API.get(endpoint)
      .then(r => setProjects(Array.isArray(r.data) ? r.data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));

    // Fetch Freelancer specific stats
    if (!isClient && uId) {
      API.get(`/projects/applications/freelancer/${uId}`)
        .then(r => setAppCount(Array.isArray(r.data) ? r.data.length : 0))
        .catch(() => setAppCount(0));

      API.get(`/projects/freelancer/${uId}`)
        .then(r => {
           const fp = Array.isArray(r.data) ? r.data : [];
           const comp = fp.filter(p => p.status === 'COMPLETED').length;
           setFreelancerCompRate(fp.length > 0 ? `${Math.round((comp / fp.length) * 100)}%` : '0%');
        })
        .catch(() => setFreelancerCompRate('0%'));
    }
  }, [isClient, user.userId, user.id]);

  const openCount = projects.filter(p => p.status === 'OPEN').length;
  const teamCount = projects.filter(p => p.projectType === 'TEAM').length;
  const myCount   = projects.length;

  // Calculate Client Stats dynamically
  const totalBudgetNum = projects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
  const formattedBudget = totalBudgetNum >= 1000 ? `₹${(totalBudgetNum/1000).toFixed(1)}K` : `₹${totalBudgetNum}`;
  const clientCompleted = projects.filter(p => p.status === 'COMPLETED').length;
  const clientCompRate = projects.length > 0 ? `${Math.round((clientCompleted / projects.length) * 100)}%` : '0%';

  const stats = [
    { label: isClient ? 'My Projects' : 'Open Projects', value: myCount,              icon:'📋', color:'#A855F7', glow:'rgba(168,85,247,0.15)' },
    { label: 'Team Projects',                             value: teamCount,             icon:'👥', color:'#60A5FA', glow:'rgba(96,165,250,0.15)'  },
    { label: isClient ? 'Total Budget' : 'Applications',  value: isClient ? formattedBudget : appCount.toString(), icon:'💰', color:'#34D399', glow:'rgba(52,211,153,0.15)'  },
    { label: 'Completion Rate',                           value: isClient ? clientCompRate : freelancerCompRate, icon:'🏆', color:'#FBBF24', glow:'rgba(251,191,36,0.15)'  },
  ];

  const quickActions = isClient
    ? [
        { label:'Post Project',   to:'/create-project',   icon:'✚',  color:'#7C3AED' },
        { label:'Browse Talent',  to:'/projects',         icon:'🔍', color:'#3B82F6' },
        { label:'My Team',        to:'/team/1',           icon:'👥', color:'#10B981' },
        { label:'Team Chat',      to:'/chat/1',           icon:'💬', color:'#F59E0B' },
        { label:'Task Board',     to:'/kanban/1',         icon:'📌', color:'#EC4899' },
        { label:'Profile',        to:'/profile',          icon:'👤', color:'#8B5CF6' },
      ]
    : [
        { label:'Find Projects',  to:'/projects',         icon:'🔍', color:'#7C3AED' },
        { label:'My Team',        to:'/team/1',           icon:'👥', color:'#10B981' },
        { label:'Team Chat',      to:'/chat/1',           icon:'💬', color:'#3B82F6' },
        { label:'Task Board',     to:'/kanban/1',         icon:'📌', color:'#F59E0B' },
        { label:'My Profile',     to:'/profile',          icon:'👤', color:'#8B5CF6' },
      ];

  return (
    <div style={s.page}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        .dash-card { animation: fadeUp 0.4s ease both; }
        .qa-card:hover { transform: translateY(-3px) !important; border-color:#7C3AED !important; box-shadow: 0 8px 24px rgba(124,58,237,0.25) !important; }
        .qa-card { transition: all 0.2s cubic-bezier(0.4,0,0.2,1) !important; }
        .skeleton { background: linear-gradient(90deg, #13141C 25%, #1A1B26 50%, #13141C 75%); background-size: 600px 100%; animation: shimmer 1.5s infinite; border-radius: 16px; }
      `}</style>

      {/* Hero Welcome Banner */}
      <div style={s.heroBanner} className="dash-card">
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={s.roleBadgeWrap}>
            <span style={{
              ...s.roleBadge,
              background: isClient ? 'rgba(124,58,237,0.2)' : 'rgba(16,185,129,0.2)',
              color:      isClient ? '#A855F7' : '#34D399',
              borderColor: isClient ? 'rgba(124,58,237,0.4)' : 'rgba(16,185,129,0.4)',
            }}>
              {isClient ? '💼 CLIENT WORKSPACE' : '💻 FREELANCER WORKSPACE'}
            </span>
          </div>

          <h1 style={s.heroTitle}>{greeting}, <span style={s.heroName}>{displayName}</span> 👋</h1>
          <p style={s.heroSub}>
            {isClient
              ? 'Manage your posted projects, review applications, and build multi-role teams.'
              : 'Discover top projects, collaborate with teams, and deliver great work.'}
          </p>
        </div>

        {/* Action Button */}
        <div style={{ position:'relative', zIndex:1, flexShrink:0 }}>
          {isClient ? (
            <Link to="/create-project" style={s.primaryCta}>✚ Post New Project</Link>
          ) : (
            <Link to="/projects" style={s.primaryCta}>🔍 Explore Open Jobs</Link>
          )}
        </div>

        {/* Ambient Hero Glow */}
        <div style={s.heroGlow} />
      </div>

      {/* Metrics Row */}
      <div style={s.statsGrid}>
        {stats.map((st, i) => (
          <div
            key={st.label}
            className="dash-card"
            style={{ ...s.statCard, animationDelay: `${i * 0.06 + 0.1}s` }}
          >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
              <span style={{ fontSize:'13px', color:'#6B7280', fontWeight:600 }}>{st.label}</span>
              <div style={{
                width:'36px', height:'36px', borderRadius:'10px',
                background: st.glow, display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'18px',
              }}>{st.icon}</div>
            </div>
            <div style={{ fontSize:'28px', fontWeight:800, color:'#F9FAFB', letterSpacing:'-0.5px' }}>
              {loading ? '—' : st.value}
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Grid: Quick Actions + Recent Activity */}
      <div style={s.twoCol}>

        {/* Left Column: Quick Actions */}
        <div className="dash-card" style={{ animationDelay:'0.3s' }}>
          <Card padding="24px">
            <h3 style={s.sectionTitle}>Quick Workspaces</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px' }}>
              {quickActions.map(action => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="qa-card"
                  style={s.qaCard}
                >
                  <div style={{
                    width:'42px', height:'42px', borderRadius:'12px',
                    background: `${action.color}15`, border: `1px solid ${action.color}30`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'20px', marginBottom:'10px',
                  }}>{action.icon}</div>
                  <span style={{ fontSize:'13px', fontWeight:700, color:'#F9FAFB', textAlign:'center' }}>
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Projects / Activity */}
        <div className="dash-card" style={{ animationDelay:'0.35s' }}>
          <Card padding="24px">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <h3 style={s.sectionTitle}>
                {isClient ? 'My Active Projects' : 'Recommended Projects'}
              </h3>
              <Link to="/projects" style={{ fontSize:'12px', color:'#A855F7', fontWeight:700 }}>
                View All →
              </Link>
            </div>

            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:'60px' }} />)}
              </div>
            ) : projects.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:'#6B7280' }}>
                <div style={{ fontSize:'36px', marginBottom:'8px' }}>📂</div>
                <p style={{ margin:0, fontSize:'14px', color:'#F9FAFB', fontWeight:600 }}>No projects found</p>
                <p style={{ margin:'4px 0 0', fontSize:'12px' }}>
                  {isClient ? 'Post your first project to start hiring!' : 'Check back soon for new opportunities.'}
                </p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {projects.slice(0, 4).map(p => (
                  <div key={p.id} style={s.projRow}>
                    <div>
                      <h4 style={s.projRowTitle}>{p.title}</h4>
                      <div style={{ display:'flex', gap:'8px', alignItems:'center', marginTop:'4px' }}>
                        <Badge color={p.projectType === 'TEAM' ? 'purple' : 'blue'}>
                          {p.projectType === 'TEAM' ? '👥 Team' : '👤 Solo'}
                        </Badge>
                        <span style={{ fontSize:'12px', color:'#6B7280' }}>{p.category || 'General'}</span>
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <span style={{ fontSize:'15px', fontWeight:800, color:'#34D399' }}>₹{p.budget}</span>
                      <div style={{ marginTop:'2px' }}>
                        <Badge color={p.status === 'OPEN' ? 'green' : 'gray'}>{p.status}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}

const s = {
  page: {
    display:'flex', flexDirection:'column', gap:'24px',
    fontFamily:'Inter, sans-serif', width:'100%',
  },
  heroBanner: {
    background:'linear-gradient(135deg, #13141C 0%, #1A1B26 100%)',
    border:'1px solid #2D2D3F', borderRadius:'24px',
    padding:'32px 36px', display:'flex', justifyContent:'space-between',
    alignItems:'center', flexWrap:'wrap', gap:'20px',
    position:'relative', overflow:'hidden',
    boxShadow:'0 8px 32px rgba(0,0,0,0.4)',
  },
  heroGlow: {
    position:'absolute', top:'-40%', right:'-10%', width:'400px', height:'400px',
    background:'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)',
    pointerEvents:'none', zIndex:0,
  },
  roleBadgeWrap: { marginBottom:'12px' },
  roleBadge: {
    padding:'4px 14px', borderRadius:'20px', border:'1px solid',
    fontSize:'11px', fontWeight:800, letterSpacing:'0.8px', textTransform:'uppercase',
  },
  heroTitle: { fontSize:'28px', fontWeight:800, color:'#F9FAFB', margin:'0 0 8px', letterSpacing:'-0.5px' },
  heroName: { background:'linear-gradient(135deg, #A855F7, #6366F1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  heroSub: { fontSize:'14px', color:'#9CA3AF', margin:0, maxWidth:'540px', lineHeight:1.6 },
  primaryCta: {
    padding:'14px 28px', background:'linear-gradient(135deg, #7C3AED, #6366F1)',
    color:'#F9FAFB', borderRadius:'12px', fontSize:'14px', fontWeight:700,
    textDecoration:'none', boxShadow:'0 4px 20px rgba(124,58,237,0.4)', display:'inline-block',
  },
  statsGrid: {
    display:'grid', gridTemplateColumns:'repeat(4, 1fr)',
    gap:'16px',
  },
  statCard: {
    background:'#13141C', borderRadius:'16px', padding:'20px 24px',
    border:'1px solid #2D2D3F', display:'flex', flexDirection:'column',
  },
  twoCol: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', alignItems:'start' },
  sectionTitle: { fontSize:'16px', fontWeight:800, color:'#F9FAFB', margin:'0 0 16px', letterSpacing:'-0.3px' },
  qaCard: {
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    background:'#0D0E15', border:'1px solid #2D2D3F', borderRadius:'14px',
    padding:'18px 12px', textDecoration:'none', cursor:'pointer',
  },
  projRow: {
    display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'12px 14px', borderRadius:'12px', background:'#0D0E15',
    border:'1px solid #2D2D3F',
  },
  projRowTitle: { fontSize:'14px', fontWeight:700, color:'#F9FAFB', margin:0 },
};