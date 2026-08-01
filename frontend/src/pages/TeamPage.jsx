import React, { useEffect, useState } from 'react';
import API from '../api/axiosInstance';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

export default function TeamPage() {
  const [projects, setProjects]   = useState([]);
  const [teamsData, setTeamsData] = useState({});
  const [loading, setLoading]     = useState(true);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const isClient = user.role === 'ROLE_CLIENT';
  const isFreelancer = user.role === 'ROLE_FREELANCER';
  const rawId = user.userId || user.id;
  const userId = rawId ? parseInt(rawId) : null;

  useEffect(() => { loadAllTeams(); }, [userId, isClient]);

  const loadAllTeams = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let all = [];
      if (isClient) {
        // Client: Fetch projects posted by this client
        try {
          const res = await API.get(`/projects/my-projects?clientId=${userId}`);
          all = Array.isArray(res.data) ? res.data : [];
        } catch { /* ignore */ }

        if (all.length === 0) {
          try {
            const fallbackRes = await API.get(`/projects/client/${userId}`);
            all = Array.isArray(fallbackRes.data) ? fallbackRes.data : [];
          } catch { /* ignore */ }
        }
      } else if (isFreelancer) {
        // Freelancer: Fetch ONLY projects where freelancer has been ACCEPTED / HIRED into the team
        try {
          const res = await API.get(`/projects/freelancer/${userId}`);
          all = Array.isArray(res.data) ? res.data : [];
        } catch { /* ignore */ }
      }

      setProjects(all);

      // Load team structure and members for each project
      const map = {};
      for (const p of all) {
        try {
          const teamRes    = await API.get(`/projects/${p.id}/team`);
          const membersRes = await API.get(`/projects/teams/${teamRes.data.id}/members`);
          const rawMembers = Array.isArray(membersRes.data) ? membersRes.data : [];

          // Enrich team members with real user profiles from auth-service
          const enrichedMembers = await Promise.all(
            rawMembers.map(async (m) => {
              if (m.userName && !m.userName.startsWith('Freelancer #')) {
                return m;
              }
              try {
                const uRes = await API.get(`/users/profile/${m.userId}`);
                const uData = uRes.data;
                const fullName = uData.name || `${uData.firstName || ''} ${uData.lastName || ''}`.trim();
                return {
                  ...m,
                  userName: fullName || uData.email?.split('@')[0] || m.userName,
                  userEmail: uData.email || m.userEmail,
                };
              } catch {
                return m;
              }
            })
          );

          map[p.id] = { team: teamRes.data, members: enrichedMembers };
        } catch { map[p.id] = null; }
      }
      setTeamsData(map);
    } catch { /* swallow */ }
    finally { setLoading(false); }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const AVATAR_COLORS = ['#7C3AED','#3B82F6','#10B981','#F59E0B','#EC4899','#6366F1'];

  return (
    <div style={{ fontFamily:'Inter, sans-serif', width: '100%' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        .team-card{animation:fadeUp 0.35s ease both;}
        .member-card:hover{border-color:rgba(124,58,237,0.4) !important;transform:translateY(-1px);}
        .member-card{transition:all 0.2s ease !important;}
        .skeleton{background:linear-gradient(90deg,#13141C 25%,#1A1B26 50%,#13141C 75%);background-size:600px 100%;animation:shimmer 1.5s infinite;border-radius:12px;}
      `}</style>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'16px', marginBottom:'28px' }} className="page-fade">
        <div>
          <h1 style={{ fontSize:'24px', fontWeight:800, color:'#F9FAFB', margin:'0 0 4px' }}>
            {isClient ? 'My Project Teams' : 'My Hired Teams'}
          </h1>
          <p style={{ color:'#6B7280', fontSize:'14px', margin:0 }}>
            {isClient
              ? 'Overview of hired freelancers and teams across your posted projects'
              : 'Overview of project teams in which you have been hired'}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadAllTeams}>🔄 Refresh Teams</Button>
      </div>

      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:'200px' }} />)}
        </div>
      ) : projects.length === 0 ? (
        <Card padding="60px">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>🤝</div>
            <h3 style={{ color:'#F9FAFB', margin:'0 0 8px' }}>
              {isClient ? 'No Active Teams Posted' : 'No Hired Teams Yet'}
            </h3>
            <p style={{ color:'#6B7280', margin:'0 0 20px', maxWidth:'460px', marginLeft:'auto', marginRight:'auto' }}>
              {isClient
                ? 'Post a project to start hiring freelancers and creating project teams.'
                : 'You have not been hired into any project teams yet. Browse open projects and apply to get accepted!'}
            </p>
            {isClient ? (
              <Link to="/create-project" style={s.linkBtn}>+ Post a Project</Link>
            ) : (
              <Link to="/projects" style={s.linkBtn}>🔍 Find Projects</Link>
            )}
          </div>
        </Card>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
          {projects.map((project, pi) => {
            const teamInfo = teamsData[project.id];
            const members  = teamInfo?.members || [];
            return (
              <Card key={project.id} padding="24px" className="team-card" style={{ animationDelay:`${pi*0.06}s` }}>
                {/* Project header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'14px', marginBottom:'20px', paddingBottom:'20px', borderBottom:'1px solid #2D2D3F' }}>
                  <div>
                    <div style={{ display:'flex', gap:'8px', marginBottom:'8px', flexWrap:'wrap' }}>
                      <Badge color={project.projectType === 'TEAM' ? 'purple' : 'blue'}>
                        {project.projectType === 'TEAM' ? '👥 Team Project' : '👤 Individual'}
                      </Badge>
                      <Badge color="green">${project.budget}</Badge>
                      <Badge color={project.status === 'OPEN' ? 'green' : 'gray'}>{project.status}</Badge>
                    </div>
                    <h3 style={{ fontSize:'18px', fontWeight:700, color:'#F9FAFB', margin:'0 0 4px' }}>{project.title}</h3>
                    <p style={{ fontSize:'13px', color:'#6B7280', margin:0 }}>{project.category} · {project.requiredSkills}</p>
                  </div>

                  <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
                    <Link to={`/kanban/${project.id}`} style={s.actionBtn}>📌 Task Board</Link>
                    <Link to={`/chat/${project.id}`} style={{ ...s.actionBtn, background:'rgba(124,58,237,0.12)', color:'#A855F7', borderColor:'rgba(124,58,237,0.25)' }}>💬 Team Chat</Link>
                  </div>
                </div>

                {/* Members */}
                {!teamInfo || members.length === 0 ? (
                  <div style={s.emptyTeam}>
                    <span style={{ fontSize:'28px', marginBottom:'8px', display:'block' }}>👥</span>
                    <p style={{ color:'#6B7280', fontSize:'14px', margin:'0 0 12px' }}>No freelancers hired yet.</p>
                    {isClient && (
                      <Link to={`/manage-applicants/${project.id}`} style={s.linkBtn}>View Applicants →</Link>
                    )}
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize:'12px', fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.8px', margin:'0 0 14px' }}>
                      Hired Members · {members.length}
                    </p>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'12px' }}>
                      {members.map((m, mi) => (
                        <div key={m.id} className="member-card" style={{ ...s.memberCard, borderColor:'#2D2D3F' }}>
                          <div style={{ ...s.memberAvatar, background: AVATAR_COLORS[mi % AVATAR_COLORS.length] }}>
                            {getInitials(m.userName)}
                          </div>
                          <div style={{ overflow:'hidden', flex:1 }}>
                            <p style={{ fontWeight:700, fontSize:'14px', color:'#F9FAFB', margin:'0 0 2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                              {m.userName || `Freelancer #${m.userId}`}
                            </p>
                            <p style={{ fontSize:'11px', color:'#6B7280', margin:'0 0 6px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                              {m.userEmail || `user${m.userId}@platform.com`}
                            </p>
                            <Badge color="purple" style={{ fontSize:'10px' }}>{m.role || 'Hired Freelancer'}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  linkBtn: {
    display:'inline-flex', alignItems:'center', gap:'6px',
    padding:'9px 18px',
    background:'linear-gradient(135deg, #7C3AED, #6366F1)',
    color:'#F9FAFB', borderRadius:'10px',
    fontSize:'13px', fontWeight:700, textDecoration:'none',
    boxShadow:'0 4px 14px rgba(124,58,237,0.35)',
  },
  actionBtn: {
    padding:'8px 16px', borderRadius:'8px',
    background:'#13141C', color:'#9CA3AF',
    border:'1px solid #2D2D3F', fontSize:'13px', fontWeight:600,
    textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'6px',
    transition:'all 0.2s',
  },
  emptyTeam: {
    textAlign:'center', padding:'28px 20px',
    background:'#0D0E15', borderRadius:'12px',
    border:'1px dashed #2D2D3F',
  },
  memberCard: {
    display:'flex', alignItems:'center', gap:'12px',
    padding:'14px', borderRadius:'12px',
    background:'#0D0E15', border:'1px solid',
    transition:'all 0.2s',
  },
  memberAvatar: {
    width:'42px', height:'42px', borderRadius:'50%', flexShrink:0,
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'14px', fontWeight:700, color:'#fff',
  },
};