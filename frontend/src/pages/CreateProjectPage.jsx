import React, { useState } from 'react';
import API from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'UI/UX Design',
  'Data Science & AI', 'DevOps & Cloud', 'Cybersecurity', 'Blockchain'
];

export default function CreateProjectPage() {
  const [projectType, setProjectType]           = useState('TEAM');
  const [title, setTitle]                       = useState('');
  const [description, setDescription]           = useState('');
  const [budget, setBudget]                     = useState('');
  const [category, setCategory]                 = useState(CATEGORIES[0]);
  const [requiredSkills, setRequiredSkills]     = useState('');
  const [deadline, setDeadline]                 = useState('');
  const [roleRequirements, setRoleRequirements] = useState([
    { roleName: 'Frontend Developer', totalSlots: 1 },
    { roleName: 'Backend Developer',  totalSlots: 1 },
  ]);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const rawId = user.userId || user.id;
  const effectiveUserId = rawId ? parseInt(rawId) : null;

  const addRole = () => setRoleRequirements(p => [...p, { roleName: '', totalSlots: 1 }]);
  const removeRole = (index) => setRoleRequirements(p => p.filter((_, i) => i !== index));
  const updateRole = (index, field, value) => {
    setRoleRequirements(p => p.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !budget || !deadline) {
      setError('Please fill in all required fields.');
      return;
    }

    if (projectType === 'TEAM') {
      const emptyRole = roleRequirements.some(r => !r.roleName.trim());
      if (emptyRole) {
        setError('Please specify names for all team roles.');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      await API.post('/projects', {
        clientId: effectiveUserId,
        title,
        description,
        projectType,
        budget: parseFloat(budget),
        category,
        requiredSkills,
        deadline,
        roleRequirements: projectType === 'TEAM' ? roleRequirements : [],
      });

      // Redirect to My Projects page
      navigate('/my-projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '840px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .create-proj-card{animation:fadeUp 0.4s ease both;}
        .type-card{transition:all 0.2s ease !important;}
        .type-card:hover{transform:translateY(-2px) !important;}
        .slot-btn:hover{background:#7C3AED !important;color:#fff !important;}
        .remove-btn:hover{color:#EF4444 !important;}
        .role-row{animation:fadeUp 0.25s ease both;}
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:'28px' }} className="page-fade">
        <h1 style={{ fontSize:'24px', fontWeight:800, color:'#F9FAFB', margin:'0 0 4px', letterSpacing:'-0.3px' }}>Post a New Project</h1>
        <p style={{ color:'#6B7280', fontSize:'14px', margin:0 }}>Fill out the details below to hire individual freelancers or an entire project team.</p>
      </div>

      {error && (
        <div style={s.errorBox}>⚠️ {error}</div>
      )}

      <form onSubmit={handleSubmit} className="create-proj-card">
        {/* Step 1: Project Type */}
        <Card padding="24px" style={{ marginBottom:'20px' }}>
          <p style={s.sectionLabel}>Select Hiring Type</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            {[
              { type:'INDIVIDUAL', icon:'👤', title:'Individual', sub:'Hire one freelancer for the job' },
              { type:'TEAM',       icon:'👥', title:'Team Project', sub:'Hire multiple roles at once' },
            ].map(opt => (
              <div
                key={opt.type}
                className="type-card"
                onClick={() => setProjectType(opt.type)}
                style={{
                  padding:'20px 16px', borderRadius:'12px', textAlign:'center', cursor:'pointer',
                  border:`2px solid ${projectType === opt.type ? '#7C3AED' : '#2D2D3F'}`,
                  background: projectType === opt.type ? 'rgba(124,58,237,0.1)' : '#0D0E15',
                  boxShadow: projectType === opt.type ? '0 0 20px rgba(124,58,237,0.15)' : 'none',
                }}
              >
                <div style={{ fontSize:'32px', marginBottom:'8px' }}>{opt.icon}</div>
                <div style={{ fontWeight:700, fontSize:'14px', color:'#F9FAFB', marginBottom:'4px' }}>{opt.title}</div>
                <div style={{ fontSize:'12px', color:'#6B7280' }}>{opt.sub}</div>
                {projectType === opt.type && (
                  <div style={{ marginTop:'10px', background:'#7C3AED', color:'#fff', borderRadius:'20px', padding:'3px 12px', fontSize:'11px', fontWeight:700, display:'inline-block' }}>
                    Selected ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Main Form */}
        <Card padding="24px" style={{ marginBottom:'20px' }}>
          <p style={s.sectionLabel}>Project Details</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
            <Input label="Project Title *" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Build a full-stack SaaS dashboard" required />
            <Input label="Description *" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the project goals, deliverables and expectations..." required rows={4} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
              <Input label="Budget (₹) *" type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="5000" required min="1" />
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', background: '#0D0E15',
                    border: '1.5px solid #2D2D3F', borderRadius: '10px',
                    color: '#F9FAFB', fontSize: '14px', fontFamily: 'Inter, sans-serif',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <Input label="Required Skills" value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)} placeholder="e.g. React, Spring Boot, MySQL, AWS (comma-separated)" />

            {/* Dual Manual Typing + Calendar Picker for Deadline */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Deadline * (Type or Pick)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="YYYY-MM-DD or DD-MM-YYYY (e.g. 2026-12-31)"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '12px 14px', background: '#0D0E15',
                    border: '1.5px solid #2D2D3F', borderRadius: '10px',
                    color: '#F9FAFB', fontSize: '14px', fontFamily: 'Inter, sans-serif',
                    outline: 'none', paddingRight: '40px', boxSizing: 'border-box',
                  }}
                />
                <input
                  type="date"
                  style={{
                    position: 'absolute', right: '10px', opacity: 0, width: '32px', height: '32px', cursor: 'pointer'
                  }}
                  onChange={e => setDeadline(e.target.value)}
                />
                <span style={{ position: 'absolute', right: '12px', pointerEvents: 'none', fontSize: '16px' }}>📅</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Team Roles (TEAM only) */}
        {projectType === 'TEAM' && (
          <Card padding="24px" style={{ marginBottom:'20px' }} glow>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <div>
                <p style={s.sectionLabel}>Team Role Requirements</p>
                <p style={{ fontSize:'13px', color:'#6B7280', margin:0 }}>Define the roles you need and how many seats each role has.</p>
              </div>
              <button type="button" onClick={addRole} style={s.addRoleBtn}>✚ Add Role</button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {roleRequirements.map((role, i) => (
                <div key={i} className="role-row" style={s.roleRow}>
                  <input
                    type="text"
                    placeholder="Role name (e.g. Backend Developer)"
                    value={role.roleName}
                    onChange={e => updateRole(i, 'roleName', e.target.value)}
                    required
                    style={s.roleInput}
                  />
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
                    <button type="button" onClick={() => updateRole(i,'totalSlots',Math.max(1,role.totalSlots-1))} style={s.slotBtn}>−</button>
                    <span style={{ fontWeight:700, color:'#A855F7', minWidth:'20px', textAlign:'center', fontSize:'16px' }}>{role.totalSlots}</span>
                    <button type="button" onClick={() => updateRole(i,'totalSlots',role.totalSlots+1)} style={s.slotBtn}>+</button>
                    <span style={{ fontSize:'12px', color:'#6B7280' }}>seats</span>
                  </div>
                  {roleRequirements.length > 1 && (
                    <button type="button" onClick={() => removeRole(i)} style={s.removeBtn}>✕</button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={loading}
        >
          {loading ? '⏳ Publishing...' : `🚀 Publish ${projectType === 'TEAM' ? 'Team' : 'Individual'} Project`}
        </Button>
      </form>
    </div>
  );
}

const s = {
  sectionLabel: { fontSize:'11px', fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.8px', margin:'0 0 14px', display:'block' },
  errorBox: { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#F87171', borderRadius:'10px', padding:'12px 16px', marginBottom:'20px', fontSize:'14px' },
  roleRow: { display:'flex', alignItems:'center', gap:'12px', background:'#0D0E15', padding:'12px 16px', borderRadius:'10px', border:'1px solid #2D2D3F' },
  roleInput: { flex:1, padding:'8px 12px', background:'#13141C', border:'1px solid #2D2D3F', borderRadius:'8px', color:'#F9FAFB', fontSize:'13px', fontFamily:'Inter, sans-serif', outline:'none' },
  slotBtn: { width:'28px', height:'28px', borderRadius:'6px', background:'#1A1B26', border:'1px solid #2D2D3F', color:'#F9FAFB', cursor:'pointer', fontSize:'14px', fontWeight:700, fontFamily:'Inter, sans-serif', transition:'all 0.15s' },
  removeBtn: { background:'none', border:'none', color:'#6B7280', cursor:'pointer', fontSize:'14px', padding:'4px', transition:'all 0.15s' },
  addRoleBtn: { padding:'8px 16px', background:'rgba(124,58,237,0.15)', color:'#A855F7', border:'1px solid rgba(124,58,237,0.3)', borderRadius:'10px', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'Inter, sans-serif' },
};