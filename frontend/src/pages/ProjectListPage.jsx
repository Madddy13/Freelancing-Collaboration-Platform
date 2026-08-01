import React, { useEffect, useState } from 'react';
import API from '../api/axiosInstance';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

export default function ProjectListPage() {
  const [projects, setProjects]       = useState([]);
  const [appliedMap, setAppliedMap]   = useState({}); // Maps projectId -> Application status
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('ALL');
  const [search, setSearch]           = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedRoleId, setSelectedRoleId]   = useState('');
  const [coverLetter, setCoverLetter]         = useState('');
  const [bidAmount, setBidAmount]             = useState('');
  const [submitting, setSubmitting]           = useState(false);
  const [toast, setToast]                     = useState('');

  const user         = JSON.parse(sessionStorage.getItem('user') || '{}');
  const isFreelancer = user.role === 'ROLE_FREELANCER';
  const isClient     = user.role === 'ROLE_CLIENT';

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = () => {
    setLoading(true);
    API.get('/projects')
      .then(r => setProjects(Array.isArray(r.data) ? r.data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/projects/apply', {
        projectId: selectedProject.id,
        freelancerId: user.userId,
        projectRoleId: selectedProject.projectType === 'TEAM' && selectedRoleId ? parseInt(selectedRoleId) : null,
        coverLetter,
        bidAmount: parseFloat(bidAmount),
      });

      // Update appliedMap state locally for immediate UI response
      setAppliedMap(prev => ({ ...prev, [selectedProject.id]: 'PENDING' }));
      setSelectedProject(null);
      setCoverLetter(''); setBidAmount(''); setSelectedRoleId('');
      showToast('✅ Application submitted successfully!');
      fetchProjects();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to apply. You may have already applied.';
      showToast('⚠️ ' + msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = projects.filter(p => {
    if (p.status === 'COMPLETED' || p.status === 'CLOSED' || p.status === 'CANCELLED') {
      return false;
    }
    const matchFilter = filter === 'ALL' || p.projectType === filter || p.status === filter;
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.requiredSkills?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ fontFamily:'Inter, sans-serif', width: '100%' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        .proj-card{animation:fadeUp 0.35s ease both;transition:all 0.2s ease !important;}
        .proj-card:hover{transform:translateY(-3px) !important;border-color:rgba(124,58,237,0.4) !important;box-shadow:0 12px 32px rgba(0,0,0,0.4) !important;}
        .filter-btn{transition:all 0.15s ease !important;}
        .filter-btn:hover{border-color:#7C3AED !important;color:#A855F7 !important;}
        .apply-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(124,58,237,0.5) !important;}
        .apply-btn{transition:all 0.2s ease !important;}
        .skeleton{background:linear-gradient(90deg,#13141C 25%,#1A1B26 50%,#13141C 75%);background-size:600px 100%;animation:shimmer 1.4s infinite;border-radius:16px;}
        .toast-n{animation:slideDown 0.3s ease both;}
        .search-inp:focus{border-color:#7C3AED !important;box-shadow:0 0 0 3px rgba(124,58,237,0.15) !important;}
        .modal-inp:focus{border-color:#7C3AED !important;box-shadow:0 0 0 3px rgba(124,58,237,0.15) !important;}
      `}</style>

      {/* Toast */}
      {toast && (
        <div className="toast-n" style={s.toast}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'16px', marginBottom:'24px' }} className="page-fade">
        <div>
          <h1 style={s.pageTitle}>Explore Projects</h1>
          <p style={s.pageSub}>{projects.length} projects available · Find your next opportunity</p>
        </div>
        {isClient && (
          <Link to="/create-project" style={s.postBtn}>✚ Post a Project</Link>
        )}
      </div>

      {/* Search + Filters */}
      <div style={s.toolbar} className="page-fade-2">
        <div style={s.searchWrap}>
          <span style={{ color:'#6B7280', fontSize:'15px' }}>🔍</span>
          <input
            className="search-inp"
            placeholder="Search by title, category, skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={s.searchInput}
          />
        </div>
        <div style={s.filters}>
          {[['ALL','⊞ All'],['TEAM','👥 Team'],['INDIVIDUAL','👤 Solo'],['OPEN','🟢 Open']].map(([val,label]) => (
            <button
              key={val}
              className="filter-btn"
              onClick={() => setFilter(val)}
              style={{
                ...s.filterBtn,
                background: filter === val ? 'rgba(124,58,237,0.15)' : '#13141C',
                color:      filter === val ? '#A855F7' : '#6B7280',
                borderColor: filter === val ? '#7C3AED' : '#2D2D3F',
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={s.grid}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height:'280px' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card padding="80px" style={{ textAlign:'center' }}>
          <div style={{ fontSize:'52px', marginBottom:'16px' }}>🔍</div>
          <h3 style={{ color:'#F9FAFB', margin:'0 0 8px' }}>No projects found</h3>
          <p style={{ color:'#6B7280', margin:0 }}>Try adjusting your filters or search term.</p>
        </Card>
      ) : (
        <div style={s.grid} className="page-fade-3">
          {filtered.map((p, i) => {
            const vacancy = p.roleRequirements?.reduce((sum, r) => sum + (r.totalSlots - r.filledSlots), 0) || 0;
            const appliedStatus = appliedMap[p.id];

            return (
              <div key={p.id} className="proj-card" style={{ ...s.card, animationDelay:`${i*0.05}s` }}>
                {/* Top row */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <Badge color={p.projectType === 'TEAM' ? 'purple' : 'blue'}>
                    {p.projectType === 'TEAM' ? '👥 Team' : '👤 Individual'}
                  </Badge>
                  <span style={{ fontSize:'18px', fontWeight:800, color:'#34D399' }}>₹{p.budget}</span>
                </div>

                {/* Title & meta */}
                <h3 style={s.cardTitle}>{p.title}</h3>
                <div style={s.cardMeta}>
                  {p.category && <span>📁 {p.category}</span>}
                  {p.deadline && <span>📅 {p.deadline}</span>}
                </div>

                {/* Skills */}
                {p.requiredSkills && (
                  <div style={s.skillsWrap}>
                    {p.requiredSkills.split(',').slice(0,4).map(sk => (
                      <span key={sk} style={s.skillChip}>{sk.trim()}</span>
                    ))}
                  </div>
                )}

                {/* Description */}
                <p style={s.cardDesc}>{p.description}</p>

                {/* Dynamic Role Vacancies (TEAM) */}
                {p.projectType === 'TEAM' && p.roleRequirements?.length > 0 && (
                  <div style={s.rolesBox}>
                    <p style={s.rolesLabel}>Live Vacancies · {vacancy} spot{vacancy !== 1 ? 's' : ''} open</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                      {p.roleRequirements.map(r => {
                        const open = r.totalSlots - r.filledSlots;
                        return (
                          <Badge key={r.id} color={open === 0 ? 'red' : open === 1 ? 'yellow' : 'green'}>
                            {r.roleName}: {open}/{r.totalSlots} Vacant
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div style={s.cardFooter}>
                  <Badge color={p.status === 'OPEN' ? 'green' : 'gray'}>{p.status}</Badge>

                  {isFreelancer && (
                    <button
                      className="apply-btn"
                      disabled={!!appliedStatus}
                      onClick={() => { setSelectedProject(p); setBidAmount(p.budget || ''); }}
                      style={{
                        ...s.applyBtn,
                        background: appliedStatus ? '#1A1B26' : 'linear-gradient(135deg,#7C3AED,#6366F1)',
                        color: appliedStatus ? '#34D399' : '#F9FAFB',
                        border: appliedStatus ? '1px solid rgba(16,185,129,0.3)' : 'none',
                        cursor: appliedStatus ? 'default' : 'pointer',
                      }}
                    >
                      {appliedStatus ? `Applied (${appliedStatus})` : 'Apply Now →'}
                    </button>
                  )}

                  {isClient && (
                    <Link to={`/manage-applicants/${p.id}`} style={s.manageBtn}>
                      View Applicants
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      {selectedProject && (
        <div style={s.overlay} onClick={() => setSelectedProject(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div style={s.modalHeader}>
              <div>
                <h3 style={s.modalTitle}>Apply: {selectedProject.title}</h3>
                <p style={s.modalSub}>{selectedProject.category} · ₹{selectedProject.budget}</p>
              </div>
              <button onClick={() => setSelectedProject(null)} style={s.closeBtn}>✕</button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleApply} style={s.modalBody}>
              {selectedProject.projectType === 'TEAM' && selectedProject.roleRequirements?.length > 0 && (
                <div style={s.formGroup}>
                  <label style={s.formLabel}>Select Role *</label>
                  <select
                    value={selectedRoleId}
                    onChange={e => setSelectedRoleId(e.target.value)}
                    required
                    className="modal-inp"
                    style={s.select}
                  >
                    <option value="">-- Choose a role --</option>
                    {selectedProject.roleRequirements
                      .filter(r => r.totalSlots - r.filledSlots > 0)
                      .map(r => (
                        <option key={r.id} value={r.id}>
                          {r.roleName} ({r.totalSlots - r.filledSlots} spots open)
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div style={s.formGroup}>
                <label style={s.formLabel}>Your Bid Amount (₹) *</label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                  required min="1"
                  className="modal-inp"
                  style={s.formInput}
                  placeholder="Enter your bid"
                />
              </div>

              <div style={s.formGroup}>
                <label style={s.formLabel}>Cover Letter *</label>
                <textarea
                  rows={5}
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  required
                  className="modal-inp"
                  placeholder="Explain why you're the best fit..."
                  style={{ ...s.formInput, resize:'vertical' }}
                />
              </div>

              <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setSelectedProject(null)} style={s.cancelBtn}>Cancel</button>
                <button type="submit" disabled={submitting} style={s.submitBtn}>
                  {submitting ? '⏳ Submitting...' : '🚀 Submit Proposal'}
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
  pageTitle: { fontSize:'26px', fontWeight:800, color:'#F9FAFB', margin:'0 0 4px', letterSpacing:'-0.3px' },
  pageSub: { fontSize:'14px', color:'#6B7280', margin:0 },
  postBtn: { padding:'11px 22px', background:'linear-gradient(135deg,#7C3AED,#6366F1)', color:'#F9FAFB', borderRadius:'10px', fontSize:'14px', fontWeight:700, textDecoration:'none', whiteSpace:'nowrap', display:'inline-block', boxShadow:'0 4px 16px rgba(124,58,237,0.4)' },
  toolbar: { display:'flex', gap:'12px', alignItems:'center', marginBottom:'24px', flexWrap:'wrap' },
  searchWrap: { display:'flex', alignItems:'center', gap:'8px', background:'#13141C', border:'1.5px solid #2D2D3F', borderRadius:'10px', padding:'9px 14px', flex:1, minWidth:'220px', transition:'border-color 0.2s' },
  searchInput: { border:'none', outline:'none', fontSize:'14px', fontFamily:'Inter, sans-serif', color:'#F9FAFB', width:'100%', background:'transparent' },
  filters: { display:'flex', gap:'6px', flexWrap:'wrap' },
  filterBtn: { padding:'9px 16px', borderRadius:'8px', border:'1.5px solid', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Inter, sans-serif', whiteSpace:'nowrap', transition:'all 0.15s' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'20px' },
  card: { background:'#13141C', borderRadius:'16px', padding:'22px', border:'1px solid #2D2D3F', display:'flex', flexDirection:'column', gap:'10px', boxShadow:'0 1px 3px rgba(0,0,0,0.3)' },
  cardTitle: { fontSize:'16px', fontWeight:700, color:'#F9FAFB', margin:0, lineHeight:1.3 },
  cardMeta: { display:'flex', gap:'14px', fontSize:'12px', color:'#6B7280', flexWrap:'wrap' },
  skillsWrap: { display:'flex', flexWrap:'wrap', gap:'6px' },
  skillChip: { background:'rgba(107,114,128,0.15)', color:'#9CA3AF', fontSize:'11px', fontWeight:600, padding:'3px 10px', borderRadius:'20px', border:'1px solid #2D2D3F' },
  cardDesc: { fontSize:'13px', color:'#6B7280', lineHeight:1.6, margin:0, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' },
  rolesBox: { background:'#0D0E15', borderRadius:'10px', padding:'12px', border:'1px solid #2D2D3F' },
  rolesLabel: { fontSize:'11px', fontWeight:700, color:'#6B7280', margin:'0 0 8px', textTransform:'uppercase', letterSpacing:'0.5px' },
  cardFooter: { display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'10px', borderTop:'1px solid #2D2D3F', marginTop:'auto' },
  applyBtn: { padding:'8px 18px', background:'linear-gradient(135deg,#7C3AED,#6366F1)', color:'#F9FAFB', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:'Inter, sans-serif', boxShadow:'0 2px 10px rgba(124,58,237,0.3)' },
  manageBtn: { padding:'8px 18px', background:'rgba(124,58,237,0.08)', color:'#9CA3AF', border:'1px solid #2D2D3F', borderRadius:'8px', fontSize:'13px', fontWeight:600, textDecoration:'none', transition:'all 0.2s' },
  toast: { position:'fixed', top:'80px', right:'24px', zIndex:9999, background:'#1A1B26', border:'1px solid #2D2D3F', color:'#F9FAFB', padding:'14px 22px', borderRadius:'12px', fontSize:'14px', fontWeight:600, boxShadow:'0 8px 32px rgba(0,0,0,0.5)' },
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' },
  modal: { background:'#13141C', border:'1px solid #2D2D3F', borderRadius:'20px', width:'100%', maxWidth:'520px', boxShadow:'0 20px 60px rgba(0,0,0,0.6)', overflow:'hidden' },
  modalHeader: { background:'linear-gradient(135deg,#7C3AED22,#6366F118)', borderBottom:'1px solid #2D2D3F', padding:'24px 28px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' },
  modalTitle: { fontSize:'18px', fontWeight:700, color:'#F9FAFB', margin:'0 0 4px' },
  modalSub: { fontSize:'13px', color:'#6B7280', margin:0 },
  closeBtn: { background:'rgba(255,255,255,0.08)', border:'1px solid #2D2D3F', borderRadius:'8px', width:'32px', height:'32px', color:'#9CA3AF', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:'Inter, sans-serif' },
  modalBody: { padding:'24px 28px', display:'flex', flexDirection:'column', gap:'16px' },
  formGroup: { display:'flex', flexDirection:'column', gap:'6px' },
  formLabel: { fontSize:'12px', fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.5px' },
  formInput: { padding:'11px 14px', background:'#0D0E15', border:'1.5px solid #2D2D3F', borderRadius:'10px', fontSize:'14px', fontFamily:'Inter, sans-serif', outline:'none', color:'#F9FAFB', transition:'all 0.2s', boxSizing:'border-box', width:'100%' },
  select: { padding:'11px 14px', background:'#0D0E15', border:'1.5px solid #2D2D3F', borderRadius:'10px', fontSize:'14px', fontFamily:'Inter, sans-serif', outline:'none', color:'#F9FAFB', transition:'all 0.2s', width:'100%', cursor:'pointer' },
  cancelBtn: { padding:'10px 20px', background:'#1A1B26', color:'#6B7280', border:'1px solid #2D2D3F', borderRadius:'10px', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:'Inter, sans-serif' },
  submitBtn: { padding:'10px 24px', background:'linear-gradient(135deg,#7C3AED,#6366F1)', color:'#F9FAFB', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'Inter, sans-serif', boxShadow:'0 4px 14px rgba(124,58,237,0.4)' },
};