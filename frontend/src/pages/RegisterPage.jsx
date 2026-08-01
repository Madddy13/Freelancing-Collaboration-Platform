import React, { useState, useEffect } from 'react';
import API from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';

// Professional SVG Icons
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
    <line x1="2" x2="22" y1="2" y2="22"></line>
  </svg>
);

const RocketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71 1.26-1.55 1.66-2.45c.42.02.84.05 1.26.05c7 0 10-7 10-7s-7 3-7 10c0 .42.03.84.05 1.26c-.9-.4-1.74-.95-2.45-1.66z"></path>
    <path d="M12 15l-3-3"></path>
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const BoltIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const CodeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);

export default function RegisterPage() {
  const [step, setStep]           = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [role, setRole]           = useState('');
  const [skills, setSkills]       = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [strength, setStrength]   = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    setStrength(s);
  }, [password]);

  const strengthColors = ['#2D2D3F','#EF4444','#F97316','#F59E0B','#10B981','#7C3AED'];
  const strengthLabels = ['','Too Weak','Weak','Fair','Good','Strong'];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/register', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        skills: role === 'ROLE_FREELANCER' ? skills.trim() : undefined,
      });
      if (res.data?.token) {
        sessionStorage.setItem('token', res.data.token);
        sessionStorage.setItem('user', JSON.stringify(res.data));
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(typeof msg === 'string' ? msg : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .reg-card{animation:fadeUp 0.5s ease both;}
        .inp:focus{border-color:#7C3AED !important;box-shadow:0 0 0 3px rgba(124,58,237,0.2) !important;background:#0D0E15 !important;}
        .role-opt{transition:all 0.2s ease !important;}
        .role-opt:hover{transform:translateY(-2px) !important;}
        .reg-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(124,58,237,0.55) !important;}
        .reg-btn{transition:all 0.2s ease !important;}
        body{background:#090A0F !important;}
      `}</style>

      {/* Ambient glow */}
      <div style={{ position:'fixed', top:'-10%', left:'20%', width:'60vw', height:'50vh', background:'radial-gradient(ellipse,rgba(124,58,237,0.1) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 }} />

      {/* LEFT PANEL */}
      <div style={s.left}>
        <div style={s.leftContent}>
          <div style={s.logo}>
            <div style={s.logoIcon}><RocketIcon /></div>
            <span style={s.logoText}>Collab<span style={{ color:'#7C3AED' }}>Lance</span></span>
          </div>
          <h1 style={s.heroText}>Join thousands of professionals today.</h1>
          <p style={s.heroSub}>Whether you're a client or a freelancer — CollabLance is where careers are built.</p>

          <div style={s.features}>
            {[
              [<BoltIcon key="bolt"/>,'Fast Hiring','Get proposals within 24 hours'],
              [<ShieldIcon key="shield"/>,'Secure Payments','Milestone-based with full protection'],
              [<GlobeIcon key="globe"/>,'Global Network','Access talent from 150+ countries'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={s.featureRow}>
                <div style={s.featureIcon}>{icon}</div>
                <div>
                  <div style={s.featureTitle}>{title}</div>
                  <div style={s.featureDesc}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={s.right}>
        <div className="reg-card" style={s.card}>
          <div style={{ marginBottom:'24px' }}>
            <h2 style={s.cardTitle}>Create Your Account</h2>
            <p style={s.cardSub}>Join CollabLance as a Client or Freelancer</p>
          </div>

          {error && (
            <div style={s.errorBox}>
              <span style={{ color: '#EF4444', fontWeight: 'bold' }}>!</span> {error}
            </div>
          )}

          {/* STEP 1: Role */}
          {step === 1 && (
            <div>
              <p style={s.stepLabel}>First, tell us who you are:</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'24px' }}>
                {[
                  { val:'ROLE_CLIENT', icon:<BriefcaseIcon />, title:"I'm a Client", sub:'I want to hire talent', activeColor:'#7C3AED', activeBg:'rgba(124,58,237,0.12)' },
                  { val:'ROLE_FREELANCER', icon:<CodeIcon />, title:"I'm a Freelancer", sub:'I want to find work', activeColor:'#10B981', activeBg:'rgba(16,185,129,0.1)' },
                ].map(opt => (
                  <div
                    key={opt.val}
                    className="role-opt"
                    onClick={() => setRole(opt.val)}
                    style={{
                      padding:'24px 16px', borderRadius:'14px', textAlign:'center', cursor:'pointer',
                      border:`2px solid ${role === opt.val ? opt.activeColor : '#2D2D3F'}`,
                      background: role === opt.val ? opt.activeBg : '#0D0E15',
                      boxShadow: role === opt.val ? `0 0 24px ${opt.activeColor}25` : 'none',
                    }}
                  >
                    <div style={{ display:'flex', justifyContent:'center', marginBottom:'10px' }}>{opt.icon}</div>
                    <div style={{ fontWeight:700, fontSize:'15px', color:'#F9FAFB', marginBottom:'4px' }}>{opt.title}</div>
                    <div style={{ fontSize:'12px', color:'#6B7280' }}>{opt.sub}</div>
                    {role === opt.val && (
                      <div style={{ marginTop:'10px', background: opt.activeColor, color:'#fff', borderRadius:'20px', padding:'3px 12px', fontSize:'11px', fontWeight:700, display:'inline-block' }}>
                        Selected ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                className="reg-btn"
                onClick={() => {
                  if (!role) { setError('Please select your role.'); return; }
                  setError(''); setStep(2);
                }}
                style={{
                  ...s.submitBtn,
                  background: role ? 'linear-gradient(135deg, #7C3AED, #6366F1)' : '#1A1B26',
                  color: role ? '#F9FAFB' : '#4B5563',
                  cursor: role ? 'pointer' : 'default',
                  boxShadow: role ? '0 4px 16px rgba(124,58,237,0.4)' : 'none',
                }}
              >Continue</button>
            </div>
          )}

          {/* STEP 2: Form */}
          {step === 2 && (
            <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'4px' }}>
                <button type="button" onClick={() => setStep(1)} style={{ background:'none', border:'none', color:'#7C3AED', cursor:'pointer', fontSize:'13px', fontWeight:600, padding:0, fontFamily:'Inter, sans-serif' }}>
                  ← Change Role
                </button>
                <span style={{
                  background: role === 'ROLE_CLIENT' ? 'rgba(124,58,237,0.15)' : 'rgba(16,185,129,0.12)',
                  color: role === 'ROLE_CLIENT' ? '#A855F7' : '#34D399',
                  padding:'3px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:700,
                  border: `1px solid ${role === 'ROLE_CLIENT' ? 'rgba(124,58,237,0.3)' : 'rgba(16,185,129,0.3)'}`,
                }}>
                  {role === 'ROLE_CLIENT' ? 'Client' : 'Freelancer'}
                </span>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div>
                  <label style={s.label}>First Name</label>
                  <input className="inp" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" required style={s.input} />
                </div>
                <div>
                  <label style={s.label}>Last Name</label>
                  <input className="inp" type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" required style={s.input} />
                </div>
              </div>

              <div>
                <label style={s.label}>Email Address</label>
                <div style={{ position:'relative' }}>
                  <span style={s.inputIcon}><MailIcon /></span>
                  <input className="inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" required style={{ ...s.input, paddingLeft:'40px' }} />
                </div>
              </div>

              <div>
                <label style={s.label}>Password</label>
                <div style={{ position:'relative' }}>
                  <span style={s.inputIcon}><LockIcon /></span>
                  <input
                    className="inp"
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    minLength={6}
                    required
                    style={{ ...s.input, paddingLeft:'40px', paddingRight:'42px' }}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={s.eyeBtn} title={showPwd ? "Hide Password" : "Show Password"}>
                    {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {password && (
                  <div style={{ marginTop:'8px' }}>
                    <div style={{ display:'flex', gap:'4px', marginBottom:'4px' }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{ flex:1, height:'3px', borderRadius:'4px', background: i <= strength ? strengthColors[strength] : '#2D2D3F', transition:'background 0.3s' }} />
                      ))}
                    </div>
                    <span style={{ fontSize:'11px', color: strengthColors[strength], fontWeight:600 }}>{strengthLabels[strength]}</span>
                  </div>
                )}
              </div>

              {/* Freelancer Skills */}
              {role === 'ROLE_FREELANCER' && (
                <div>
                  <label style={s.label}>Skills (Comma-Separated) *</label>
                  <input
                    className="inp"
                    type="text"
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                    placeholder="e.g. React, Java, Spring Boot, MySQL"
                    required
                    style={s.input}
                  />
                </div>
              )}

              <button
                className="reg-btn"
                type="submit"
                disabled={loading}
                style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', marginTop:'6px' }}
              >
                {loading
                  ? <><span style={s.spinner} /> Creating Account...</>
                  : 'Create Account'
                }
              </button>
            </form>
          )}

          <p style={{ textAlign:'center', marginTop:'24px', fontSize:'14px', color:'#6B7280' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#A855F7', fontWeight:700 }}>Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight:'100vh',
    width:'100%',
    display:'flex',
    fontFamily:'Inter, sans-serif',
    background:'#090A0F',
    position:'relative',
    overflowX:'hidden',
  },
  left: {
    flex:1,
    display:'flex', alignItems:'center', justifyContent:'center',
    padding:'60px 5%', position:'relative', zIndex:1,
  },
  leftContent: { maxWidth:'480px', width:'100%' },
  logo: { display:'flex', alignItems:'center', gap:'12px', marginBottom:'48px' },
  logoIcon: {
    width:'44px', height:'44px', borderRadius:'12px',
    background:'linear-gradient(135deg,#7C3AED,#6366F1)',
    display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow:'0 4px 16px rgba(124,58,237,0.5)',
  },
  logoText: { fontSize:'22px', fontWeight:800, color:'#F9FAFB', letterSpacing:'-0.5px' },
  heroText: { fontSize:'40px', fontWeight:800, color:'#F9FAFB', lineHeight:1.2, margin:'0 0 16px', letterSpacing:'-0.5px' },
  heroSub: { fontSize:'15px', color:'#6B7280', lineHeight:1.7, margin:'0 0 40px' },
  features: { display:'flex', flexDirection:'column', gap:'20px' },
  featureRow: { display:'flex', alignItems:'flex-start', gap:'16px' },
  featureIcon: {
    width:'42px', height:'42px', borderRadius:'12px',
    background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)',
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
  },
  featureTitle: { fontWeight:700, color:'#F9FAFB', fontSize:'15px', marginBottom:'3px' },
  featureDesc: { fontSize:'13px', color:'#6B7280', lineHeight:1.5 },
  right: {
    flex: 1,
    maxWidth:'640px',
    display:'flex', alignItems:'center', justifyContent:'center',
    padding:'48px 5%',
    borderLeft:'1px solid #2D2D3F',
    background:'rgba(13,14,21,0.6)',
    backdropFilter:'blur(20px)',
    position:'relative', zIndex:1,
  },
  card: {
    background:'#13141C', border:'1px solid #2D2D3F',
    borderRadius:'24px', padding:'40px',
    width:'100%', maxWidth:'520px', boxShadow:'0 8px 40px rgba(0,0,0,0.5)',
  },
  cardTitle: { fontSize:'24px', fontWeight:800, color:'#F9FAFB', margin:'0 0 6px', letterSpacing:'-0.3px' },
  cardSub: { fontSize:'14px', color:'#6B7280', margin:0 },
  errorBox: {
    background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)',
    color:'#F87171', borderRadius:'10px', padding:'12px 14px',
    fontSize:'13px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px'
  },
  stepLabel: { fontSize:'13px', color:'#9CA3AF', marginBottom:'16px', fontWeight:500 },
  label: { display:'block', fontSize:'11px', fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' },
  inputIcon: { position:'absolute', left:'13px', top:'50%', transform:'translateY(-50%)', display:'flex', alignItems:'center', pointerEvents:'none', zIndex:1 },
  input: {
    width:'100%', padding:'12px 14px',
    background:'#0D0E15', border:'1.5px solid #2D2D3F',
    borderRadius:'10px', color:'#F9FAFB', fontSize:'14px',
    fontFamily:'Inter, sans-serif', outline:'none',
    transition:'all 0.2s', boxSizing:'border-box',
  },
  eyeBtn: { position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', padding:0 },
  submitBtn: {
    width:'100%', padding:'14px',
    background:'linear-gradient(135deg,#7C3AED,#6366F1)',
    color:'#F9FAFB', border:'none', borderRadius:'10px',
    fontSize:'15px', fontWeight:700, fontFamily:'Inter, sans-serif',
    display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
    boxShadow:'0 4px 16px rgba(124,58,237,0.4)',
  },
  spinner: {
    display:'inline-block', width:'16px', height:'16px',
    border:'2px solid rgba(255,255,255,0.2)', borderTopColor:'#fff',
    borderRadius:'50%', animation:'spin 0.7s linear infinite',
  },
};