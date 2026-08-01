import React, { useEffect, useState } from 'react';
import API from '../api/axiosInstance';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

export default function ManageApplicantsPage() {
  const { projectId } = useParams();
  const [applications, setApplications]     = useState([]);
  const [project, setProject]               = useState(null);
  const [loading, setLoading]               = useState(true);
  const [unauthorized, setUnauthorized]     = useState(false);
  const [toast, setToast]                   = useState('');

  // Selected Freelancer Profile Modal state
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [certifications, setCertifications]   = useState([]);
  const [loadingProfile, setLoadingProfile]   = useState(false);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const isClient = user.role === 'ROLE_CLIENT';

  useEffect(() => { fetchData(); }, [projectId]);

  const fetchData = async () => {
    setLoading(true);
    setUnauthorized(false);
    try {
      const [projRes, appsRes] = await Promise.all([
        API.get(`/projects/${projectId}`),
        API.get(`/projects/${projectId}/applications`),
      ]);
      const proj = projRes.data;

      // Ownership Security Check: Clients can ONLY manage applicants for their OWN projects
      if (isClient && String(proj.clientId) !== String(user.userId)) {
        setUnauthorized(true);
        return;
      }

      setProject(proj);

      const rawApps = Array.isArray(appsRes.data) ? appsRes.data : [];

      // Enrich each application with real user details from auth-service
      const enrichedApps = await Promise.all(
        rawApps.map(async (app) => {
          if (!app.freelancerId) return app;
          try {
            const userRes = await API.get(`/users/profile/${app.freelancerId}`);
            const uData = userRes.data;
            const fullName = uData.name || `${uData.firstName || ''} ${uData.lastName || ''}`.trim();
            const realName = fullName || uData.email?.split('@')[0] || `Freelancer #${app.freelancerId}`;
            return {
              ...app,
              freelancerName: realName,
              freelancerEmail: uData.email || '',
              freelancerSkills: uData.skills || '',
              avatarUrl: uData.avatarUrl || null,
              bio: uData.bio || '',
              hourlyRate: uData.hourlyRate || null,
              portfolioUrl: uData.portfolioUrl || null,
            };
          } catch (e) {
            return {
              ...app,
              freelancerName: app.freelancerName || `Freelancer #${app.freelancerId}`,
            };
          }
        })
      );

      setApplications(enrichedApps);
    } catch { /* swallow */ }
    finally { setLoading(false); }
  };

  const openFreelancerProfile = async (app) => {
    setLoadingProfile(true);
    try {
      const [uRes, certRes] = await Promise.all([
        API.get(`/users/profile/${app.freelancerId}`),
        API.get(`/users/certifications/${app.freelancerId}`),
      ]);
      setSelectedProfile({ ...app, ...uRes.data });
      setCertifications(Array.isArray(certRes.data) ? certRes.data : []);
    } catch {
      setSelectedProfile(app);
      setCertifications([]);
    } finally {
      setLoadingProfile(false);
    }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const handleAccept = async (id) => {
    try {
      await API.put(`/projects/applications/${id}/accept`);
      showToast('✅ Freelancer accepted and added to team!');
      if (selectedProfile?.id === id) setSelectedProfile(null);
      fetchData();
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Failed to accept. Role may be fully staffed.'));
    }
  };

  const handleReject = async (id) => {
    try {
      await API.put(`/projects/applications/${id}/reject`);
      showToast('🚫 Application rejected.');
      if (selectedProfile?.id === id) setSelectedProfile(null);
      fetchData();
    } catch {
      showToast('❌ Failed to reject application.');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleName = (roleId) => {
    if (!roleId || !project?.roleRequirements) return null;
    const req = project.roleRequirements.find(r => String(r.id) === String(roleId));
    return req ? req.roleName : null;
  };

  const statusBadgeColor = (status) =>
    status === 'ACCEPTED' ? 'green' : status === 'REJECTED' ? 'red' : 'yellow';

  const AVATAR_COLORS = ['#7C3AED','#3B82F6','#10B981','#F59E0B','#EC4899','#6366F1'];

  if (unauthorized) {
    return (
      <div style={{ padding: '40px 0', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
        <Card padding="60px" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ color: '#F9FAFB', margin: '0 0 8px' }}>Access Denied</h2>
          <p style={{ color: '#9CA3AF', margin: '0 0 24px', lineHeight: 1.6 }}>
            You do not have permission to view applicants for this project. Clients can only access applicant details for projects they posted.
          </p>
          <Link to="/my-projects" style={s.acceptBtn}>← Back to My Projects</Link>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ fontFamily:'Inter, sans-serif', width: '100%' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        .app-card{animation:fadeUp 0.35s ease both;}
        .skeleton{background:linear-gradient(90deg,#13141C 25%,#1A1B26 50%,#13141C 75%);background-size:600px 100%;animation:shimmer 1.5s infinite;border-radius:12px;}
        .toast-n{animation:slideDown 0.3s ease both;}
        .accept-btn:hover{background:rgba(16,185,129,0.2) !important;}
        .reject-btn:hover{background:rgba(239,68,68,0.15) !important;}
        .profile-btn:hover{background:rgba(124,58,237,0.2) !important;border-color:#7C3AED !important;color:#A855F7 !important;}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(6px);z-index:9990;display:flex;align-items:center;justify-content:center;padding:20px;}
        .modal-box{background:#13141C;border:1px solid #2D2D3F;border-radius:24px;width:100%;max-width:680px;max-height:90vh;overflow-y:auto;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,0.6);animation:fadeUp 0.3s ease both;}
      `}</style>

      {/* Toast */}
      {toast && (
        <div className="toast-n" style={s.toast}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ marginBottom:'24px' }} className="page-fade">
        <h1 style={s.pageTitle}>Manage Applicants</h1>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginTop:'6px' }}>
          {project && (
            <>
              <Badge color={project.projectType === 'TEAM' ? 'purple' : 'blue'}>
                {project.projectType === 'TEAM' ? '👥 Team Project' : '👤 Individual'}
              </Badge>
              <span style={{ color:'#6B7280', fontSize:'14px' }}>{project.title}</span>
            </>
          )}
          <Badge color="gray">{applications.length} applicant{applications.length !== 1 ? 's' : ''}</Badge>
        </div>
      </div>

      {/* Team Capacity (TEAM projects) */}
      {project?.projectType === 'TEAM' && project.roleRequirements?.length > 0 && (
        <Card padding="20px" style={{ marginBottom:'20px' }} className="page-fade-2">
          <p style={s.sectionLabel}>Team Capacity Overview</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'12px' }}>
            {project.roleRequirements.map(role => {
              const pct = Math.round((role.filledSlots / role.totalSlots) * 100);
              const full = role.filledSlots >= role.totalSlots;
              return (
                <div key={role.id} style={s.roleCapCard}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                    <span style={{ fontWeight:700, fontSize:'13px', color:'#F9FAFB' }}>{role.roleName}</span>
                    <Badge color={full ? 'red' : 'green'}>{role.filledSlots}/{role.totalSlots}</Badge>
                  </div>
                  <div style={s.progressBar}>
                    <div style={{ ...s.progressFill, width:`${pct}%`, background: full ? '#EF4444' : '#10B981' }} />
                  </div>
                  <span style={{ fontSize:'11px', color:'#6B7280', marginTop:'4px', display:'block' }}>
                    {full ? 'Fully Staffed' : `${role.totalSlots - role.filledSlots} spot${role.totalSlots - role.filledSlots !== 1 ? 's' : ''} open`}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Applications Grid */}
      {loading ? (
        <div style={s.grid}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:'200px' }} />)}
        </div>
      ) : applications.length === 0 ? (
        <Card padding="60px">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>📭</div>
            <h3 style={{ color:'#F9FAFB', margin:'0 0 8px' }}>No Applications Yet</h3>
            <p style={{ color:'#6B7280', margin:0 }}>Applications submitted for this project will appear here.</p>
          </div>
        </Card>
      ) : (
        <div style={s.grid} className="page-fade-3">
          {applications.map((app, i) => {
            const displayName = app.freelancerName || `Freelancer #${app.freelancerId}`;
            const roleName    = getRoleName(app.projectRoleId);
            const avatarBg    = AVATAR_COLORS[i % AVATAR_COLORS.length];

            return (
              <div key={app.id} className="app-card" style={{ animationDelay:`${i*0.05}s` }}>
                <Card padding="22px" glow={app.status === 'PENDING'}>
                  {/* App header */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      {app.avatarUrl ? (
                        <img
                          src={`${process.env.REACT_APP_API_BASE || 'http://localhost:8080'}${app.avatarUrl}`}
                          alt={displayName}
                          style={{ width:'42px', height:'42px', borderRadius:'50%', objectFit:'cover', border:'2px solid #7C3AED' }}
                        />
                      ) : (
                        <div style={{ ...s.freelancerAvatar, background: avatarBg }}>
                          {getInitials(displayName)}
                        </div>
                      )}
                      <div>
                        <p style={{ fontWeight:700, fontSize:'15px', color:'#F9FAFB', margin:0 }}>
                          {displayName}
                        </p>
                        {app.freelancerEmail && (
                          <p style={{ fontSize:'12px', color:'#6B7280', margin:'2px 0 0' }}>{app.freelancerEmail}</p>
                        )}
                        {roleName && (
                          <p style={{ fontSize:'11px', color:'#A855F7', margin:'2px 0 0', fontWeight:600 }}>Applied for: {roleName}</p>
                        )}
                      </div>
                    </div>
                    <Badge color={statusBadgeColor(app.status)}>{app.status}</Badge>
                  </div>

                  {/* Bid */}
                  <div style={s.bidBox}>
                    <span style={{ fontSize:'12px', color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.5px' }}>Bid Amount</span>
                    <span style={{ fontSize:'20px', fontWeight:800, color:'#34D399' }}>₹{app.bidAmount}</span>
                  </div>

                  {/* Cover letter */}
                  <div style={{ marginTop:'14px', marginBottom:'16px' }}>
                    <p style={{ fontSize:'11px', color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.5px', margin:'0 0 6px' }}>Cover Letter</p>
                    <p style={{ fontSize:'13px', color:'#9CA3AF', lineHeight:1.6, margin:0, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                      {app.coverLetter || 'No cover letter provided.'}
                    </p>
                  </div>

                  {/* View Full Profile CTA */}
                  <button
                    className="profile-btn"
                    onClick={() => openFreelancerProfile(app)}
                    style={{
                      width:'100%', padding:'8px', borderRadius:'8px',
                      background:'#0D0E15', color:'#9CA3AF', border:'1px solid #2D2D3F',
                      fontSize:'12px', fontWeight:600, cursor:'pointer', marginBottom:'12px',
                      transition:'all 0.2s', fontFamily:'Inter, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                    }}
                  >
                    👁️ View Full Profile & Certifications
                  </button>

                  {/* Accept / Reject Actions */}
                  {app.status === 'PENDING' && (
                    <div style={{ display:'flex', gap:'8px', paddingTop:'14px', borderTop:'1px solid #2D2D3F' }}>
                      <button
                        className="accept-btn"
                        onClick={() => handleAccept(app.id)}
                        style={s.acceptBtn}
                      >✓ Accept & Hire</button>
                      <button
                        className="reject-btn"
                        onClick={() => handleReject(app.id)}
                        style={s.rejectBtn}
                      >✕ Reject</button>
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* ── FREELANCER PROFILE & CERTIFICATIONS MODAL ── */}
      {selectedProfile && (
        <div className="modal-overlay" onClick={() => setSelectedProfile(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px', paddingBottom:'16px', borderBottom:'1px solid #2D2D3F' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                {selectedProfile.avatarUrl ? (
                  <img
                    src={`${process.env.REACT_APP_API_BASE || 'http://localhost:8080'}${selectedProfile.avatarUrl}`}
                    alt="Avatar"
                    style={{ width:'64px', height:'64px', borderRadius:'50%', objectFit:'cover', border:'3px solid #7C3AED' }}
                  />
                ) : (
                  <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'linear-gradient(135deg, #7C3AED, #6366F1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:800, color:'#fff' }}>
                    {getInitials(selectedProfile.freelancerName)}
                  </div>
                )}
                <div>
                  <h3 style={{ fontSize:'20px', fontWeight:800, color:'#F9FAFB', margin:'0 0 4px' }}>
                    {selectedProfile.freelancerName}
                  </h3>
                  <p style={{ color:'#6B7280', fontSize:'13px', margin:'0 0 6px' }}>{selectedProfile.freelancerEmail}</p>
                  <Badge color="purple">{selectedProfile.role || 'Freelancer'}</Badge>
                </div>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                style={{ background:'#1A1B26', border:'1px solid #2D2D3F', color:'#9CA3AF', borderRadius:'8px', width:'32px', height:'32px', cursor:'pointer', fontSize:'16px', fontWeight:700 }}
              >✕</button>
            </div>

            {/* Bio */}
            {selectedProfile.bio && (
              <div style={{ marginBottom:'20px' }}>
                <label style={s.sectionLabel}>Overview / Bio</label>
                <p style={{ fontSize:'14px', color:'#D1D5DB', lineHeight:1.6, margin:0, background:'#0D0E15', padding:'14px', borderRadius:'12px', border:'1px solid #2D2D3F' }}>
                  {selectedProfile.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {selectedProfile.skills && (
              <div style={{ marginBottom:'20px' }}>
                <label style={s.sectionLabel}>Skills & Expertise</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {selectedProfile.skills.split(',').map((skill, idx) => (
                    <span key={idx} style={{ background:'rgba(124,58,237,0.15)', color:'#A855F7', border:'1px solid rgba(124,58,237,0.3)', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:700 }}>
                      ⚡ {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rate & Portfolio */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'24px', background:'#0D0E15', padding:'16px', borderRadius:'12px', border:'1px solid #2D2D3F' }}>
              <div>
                <label style={{ fontSize:'11px', color:'#6B7280', fontWeight:700, textTransform:'uppercase', display:'block', marginBottom:'4px' }}>Hourly Rate</label>
                <span style={{ fontSize:'16px', fontWeight:800, color:'#34D399' }}>
                  {selectedProfile.hourlyRate ? `₹${selectedProfile.hourlyRate}/hr` : 'Negotiable'}
                </span>
              </div>
              <div>
                <label style={{ fontSize:'11px', color:'#6B7280', fontWeight:700, textTransform:'uppercase', display:'block', marginBottom:'4px' }}>Portfolio</label>
                {selectedProfile.portfolioUrl ? (
                  <a href={selectedProfile.portfolioUrl} target="_blank" rel="noreferrer" style={{ fontSize:'13px', color:'#60A5FA', fontWeight:600 }}>
                    🔗 View Portfolio
                  </a>
                ) : <span style={{ color:'#6B7280', fontSize:'13px' }}>—</span>}
              </div>
            </div>

            {/* Verified Certifications List & PDFs */}
            <div style={{ marginBottom:'24px' }}>
              <label style={s.sectionLabel}>Verified Certifications ({certifications.length})</label>
              {certifications.length === 0 ? (
                <div style={{ textAlign:'center', padding:'20px', background:'#0D0E15', borderRadius:'12px', border:'1px dashed #2D2D3F', color:'#6B7280', fontSize:'13px' }}>
                  No certifications uploaded yet.
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {certifications.map(cert => (
                    <div key={cert.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'#0D0E15', border:'1px solid #2D2D3F', borderRadius:'10px' }}>
                      <div>
                        <h5 style={{ margin:'0 0 2px', color:'#F9FAFB', fontSize:'14px', fontWeight:700 }}>{cert.title}</h5>
                        <p style={{ margin:0, color:'#A855F7', fontSize:'12px', fontWeight:600 }}>{cert.organization}</p>
                      </div>

                      <div style={{ display:'flex', gap:'8px' }}>
                        {cert.credentialUrl && (
                          <a href={cert.credentialUrl} target="_blank" rel="noreferrer" style={{ padding:'5px 10px', background:'#1A1B26', color:'#60A5FA', border:'1px solid #2D2D3F', borderRadius:'6px', fontSize:'11px', fontWeight:600, textDecoration:'none' }}>
                            🔗 Credential
                          </a>
                        )}
                        {cert.certificatePdfUrl && (
                          <a href={`${process.env.REACT_APP_API_BASE || 'http://localhost:8080'}${cert.certificatePdfUrl}`} target="_blank" rel="noreferrer" style={{ padding:'5px 12px', background:'rgba(52,211,153,0.15)', color:'#34D399', border:'1px solid rgba(52,211,153,0.3)', borderRadius:'6px', fontSize:'12px', fontWeight:700, textDecoration:'none' }}>
                            📄 View PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            {selectedProfile.status === 'PENDING' && (
              <div style={{ display:'flex', gap:'12px', paddingTop:'16px', borderTop:'1px solid #2D2D3F' }}>
                <button onClick={() => handleAccept(selectedProfile.id)} style={s.acceptBtn}>✓ Accept & Hire Freelancer</button>
                <button onClick={() => handleReject(selectedProfile.id)} style={s.rejectBtn}>✕ Reject Application</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  pageTitle: { fontSize:'24px', fontWeight:800, color:'#F9FAFB', margin:0, letterSpacing:'-0.3px' },
  sectionLabel: { fontSize:'11px', fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.8px', margin:'0 0 8px', display:'block' },
  toast: { position:'fixed', top:'80px', right:'24px', zIndex:9999, background:'#1A1B26', border:'1px solid #2D2D3F', color:'#F9FAFB', padding:'14px 22px', borderRadius:'12px', fontSize:'14px', fontWeight:600, boxShadow:'0 8px 32px rgba(0,0,0,0.5)' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'16px' },
  roleCapCard: { background:'#0D0E15', border:'1px solid #2D2D3F', borderRadius:'10px', padding:'14px', minWidth:'160px', flex:'1' },
  progressBar: { height:'6px', borderRadius:'4px', background:'#2D2D3F', overflow:'hidden' },
  progressFill: { height:'100%', borderRadius:'4px', transition:'width 0.4s ease' },
  freelancerAvatar: {
    width:'42px', height:'42px', borderRadius:'50%', flexShrink:0,
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'14px', fontWeight:700, color:'#fff',
  },
  bidBox: {
    display:'flex', justifyContent:'space-between', alignItems:'center',
    background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)',
    borderRadius:'10px', padding:'12px 16px',
  },
  acceptBtn: {
    flex:1, padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer',
    background:'rgba(16,185,129,0.15)', color:'#34D399',
    fontSize:'14px', fontWeight:700, fontFamily:'Inter, sans-serif',
    border:'1px solid rgba(16,185,129,0.3)', transition:'all 0.2s', textDecoration:'none', textAlign:'center', display:'inline-block',
  },
  rejectBtn: {
    flex:1, padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer',
    background:'rgba(239,68,68,0.1)', color:'#F87171',
    fontSize:'14px', fontWeight:700, fontFamily:'Inter, sans-serif',
    border:'1px solid rgba(239,68,68,0.25)', transition:'all 0.2s',
  },
};