import React, { useState } from 'react';
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

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });
      if (res.data?.token) {
        sessionStorage.setItem('token', res.data.token);
        sessionStorage.setItem('user', JSON.stringify(res.data));
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(typeof msg === 'string' ? msg : 'Login failed. Please try again.');
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
        .login-card{animation:fadeUp 0.5s ease both;}
        .inp:focus{border-color:#7C3AED !important;box-shadow:0 0 0 3px rgba(124,58,237,0.2) !important;background:#0D0E15 !important;}
        .login-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(124,58,237,0.55) !important;}
        .login-btn{transition:all 0.2s ease !important;}
        body{background:#090A0F !important;}
      `}</style>

      {/* Ambient glow */}
      <div style={{ position:'fixed', top:'-10%', left:'20%', width:'60vw', height:'50vh', background:'radial-gradient(ellipse,rgba(124,58,237,0.1) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:'5%', right:'5%', width:'30vw', height:'30vh', background:'radial-gradient(ellipse,rgba(99,102,241,0.07) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 }} />

      {/* LEFT PANEL */}
      <div style={s.left}>
        <div style={s.leftContent}>
          <div style={s.logo}>
            <div style={s.logoIcon}><RocketIcon /></div>
            <span style={s.logoText}>Collab<span style={{ color:'#7C3AED' }}>Lance</span></span>
          </div>
          <h1 style={s.heroText}>
            The Future of{'\n'}
            <span style={{ background:'linear-gradient(135deg,#A855F7,#6366F1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', display:'block' }}>
              Freelance Work
            </span>
          </h1>
          <p style={s.heroSub}>Connect with world-class talent, manage projects seamlessly, and build teams — all in one obsidian-dark workspace.</p>

          <div style={s.statsRow}>
            {[['12K+','Freelancers'],['3K+','Projects'],['98%','Success Rate']].map(([val,lab]) => (
              <div key={lab} style={s.stat}>
                <div style={s.statVal}>{val}</div>
                <div style={s.statLab}>{lab}</div>
              </div>
            ))}
          </div>

          <div style={s.featuresList}>
            {[
              [<BoltIcon key="bolt"/>, 'Instant Matching'],
              [<ShieldIcon key="shield"/>, 'Secure Payments'],
              [<GlobeIcon key="globe"/>, 'Global Talent']
            ].map(([icon,txt]) => (
              <div key={txt} style={s.featureRow}>
                <div style={s.featureIcon}>{icon}</div>
                <span style={{ color:'#9CA3AF', fontSize:'14px' }}>{txt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={s.right}>
        <div className="login-card" style={s.card}>
          <div style={{ marginBottom:'28px' }}>
            <h2 style={s.cardTitle}>Welcome Back</h2>
            <p style={s.cardSub}>Sign in to your workspace to continue</p>
          </div>

          {error && (
            <div style={s.errorBox}>
              <span style={{ color: '#EF4444', fontWeight: 'bold' }}>!</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {/* Email */}
            <div>
              <label style={s.label}>Email Address</label>
              <div style={{ position:'relative' }}>
                <span style={s.inputIcon}><MailIcon /></span>
                <input
                  className="inp"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={s.input}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                <label style={s.label}>Password</label>
                <Link to="/forgot-password" style={{ fontSize:'12px', color:'#7C3AED', fontWeight:600 }}>Forgot password?</Link>
              </div>
              <div style={{ position:'relative' }}>
                <span style={s.inputIcon}><LockIcon /></span>
                <input
                  className="inp"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ ...s.input, paddingRight:'42px' }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={s.eyeBtn} title={showPwd ? "Hide Password" : "Show Password"}>
                  {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              className="login-btn"
              type="submit"
              disabled={loading}
              style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading
                ? <><span style={s.spinner} /> Signing in...</>
                : 'Sign In'
              }
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop: '20px', fontSize:'14px', color:'#6B7280' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'#A855F7', fontWeight:700 }}>Create Account</Link>
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
    flex: 1,
    display:'flex', alignItems:'center', justifyContent:'center',
    padding:'60px 5%',
    position:'relative', zIndex:1,
  },
  leftContent: { maxWidth:'480px', width:'100%' },
  logo: { display:'flex', alignItems:'center', gap:'12px', marginBottom:'44px' },
  logoIcon: {
    width:'44px', height:'44px', borderRadius:'12px',
    background:'linear-gradient(135deg,#7C3AED,#6366F1)',
    display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow:'0 4px 16px rgba(124,58,237,0.5)',
  },
  logoText: { fontSize:'22px', fontWeight:800, color:'#F9FAFB', letterSpacing:'-0.5px' },
  heroText: {
    fontSize:'42px', fontWeight:800, color:'#F9FAFB',
    lineHeight:1.15, margin:'0 0 20px', letterSpacing:'-1px',
    whiteSpace:'pre-line',
  },
  heroSub: { fontSize:'15px', color:'#6B7280', lineHeight:1.7, margin:'0 0 40px' },
  statsRow: { display:'flex', gap:'16px', marginBottom:'36px' },
  stat: {
    background:'rgba(124,58,237,0.08)',
    border:'1px solid rgba(124,58,237,0.2)',
    borderRadius:'12px', padding:'14px 18px', flex:1,
  },
  statVal: { fontSize:'22px', fontWeight:800, color:'#A855F7', lineHeight:1 },
  statLab: { fontSize:'11px', color:'#6B7280', marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.5px' },
  featuresList: { display:'flex', flexDirection:'column', gap:'12px' },
  featureRow: { display:'flex', alignItems:'center', gap:'12px' },
  featureIcon: {
    width:'34px', height:'34px', borderRadius:'8px',
    background:'rgba(124,58,237,0.1)',
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
  },
  right: {
    flex: 1,
    maxWidth:'600px',
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
    width:'100%', maxWidth:'480px',
    boxShadow:'0 8px 40px rgba(0,0,0,0.5)',
  },
  cardTitle: { fontSize:'24px', fontWeight:800, color:'#F9FAFB', margin:'0 0 4px', letterSpacing:'-0.3px' },
  cardSub: { fontSize:'14px', color:'#6B7280', margin:0 },
  errorBox: {
    background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)',
    color:'#F87171', borderRadius:'10px', padding:'12px 14px',
    fontSize:'13px', display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px',
  },
  label: { display:'block', fontSize:'11px', fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' },
  inputIcon: { position:'absolute', left:'13px', top:'50%', transform:'translateY(-50%)', display:'flex', alignItems:'center', pointerEvents:'none', zIndex:1 },
  input: {
    width:'100%', padding:'12px 14px 12px 40px',
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