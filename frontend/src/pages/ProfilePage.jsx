// src/pages/ProfilePage.jsx
// Unified dark-themed profile page — full name editing, avatar overlay, skill badges, and certifications

import React, { useEffect, useState, useRef } from 'react';
import API from '../api/axiosInstance';
import CertificationsList from '../components/profile/CertificationsList';
import { SkeletonProfile } from '../components/ui/Skeleton';

export default function ProfilePage() {
  const [profile, setProfile]                 = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [editing, setEditing]                 = useState(false);
  const [saved, setSaved]                     = useState(false);
  const [toast, setToast]                     = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [form, setForm]                       = useState({});
  const avatarInputRef = useRef(null);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const rawId = user.userId || user.id;
  const userId = rawId ? parseInt(rawId) : null;

  const isFreelancer = user.role === 'ROLE_FREELANCER';
  const isClient     = user.role === 'ROLE_CLIENT';

  useEffect(() => {
    if (userId) {
      API.get(`/users/profile/${userId}`)
        .then(res => {
          setProfile(res.data);
          setForm(res.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [userId]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleSave = async () => {
    if (!userId) {
      showToast('❌ User session invalid. Please log in again.');
      return;
    }
    try {
      const payload = {
        firstName: form.firstName || '',
        lastName: form.lastName || '',
        name: `${form.firstName || ''} ${form.lastName || ''}`.trim(),
        bio: form.bio || '',
        skills: form.skills || '',
        hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : null,
        portfolioUrl: form.portfolioUrl || '',
        companyName: form.companyName || '',
        industry: form.industry || '',
        website: form.website || '',
      };

      const res = await API.put(`/users/profile/${userId}`, payload);
      setProfile(res.data);
      setForm(res.data);

      // Update local storage user if name changed so header/sidebar update instantly
      const updatedUser = {
        ...user,
        firstName: res.data.firstName || form.firstName,
        lastName: res.data.lastName || form.lastName
      };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));

      setEditing(false);
      setSaved(true);
      showToast('✅ Profile saved successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      showToast('❌ Failed to save profile: ' + (err.response?.data?.message || err.message || 'Server error'));
    }
  };

  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('⚠️ Image must be under 10MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await API.post(`/users/avatar/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newUrl = res.data?.avatarUrl || URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, avatarUrl: newUrl }));
      showToast('✅ Profile picture updated successfully!');
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatarUrl: reader.result }));
        showToast('✅ Profile picture updated!');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const fullName = profile?.firstName || profile?.lastName
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    : profile?.name || user.firstName || user.email?.split('@')[0] || 'User Profile';

  const getInitials = () => {
    const fn = profile?.firstName || user.firstName || '';
    const ln = profile?.lastName || user.lastName || '';
    return (fn[0] || '') + (ln[0] || '') || user.email?.[0]?.toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
        <SkeletonProfile />
      </div>
    );
  }

  const avatarSrc = profile?.avatarUrl
    ? (profile.avatarUrl.startsWith('data:') || profile.avatarUrl.startsWith('blob:')
        ? profile.avatarUrl
        : `${process.env.REACT_APP_API_BASE || 'http://localhost:8080'}${profile.avatarUrl}`)
    : null;

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .toast-notif { animation: slideDown 0.3s ease both; }
        .avatar-hover-overlay {
          position: absolute; inset: 0; border-radius: 50%;
          background: rgba(9, 10, 15, 0.75); backdrop-filter: blur(2px);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s ease; cursor: pointer; color: #F9FAFB;
        }
        .avatar-container:hover .avatar-hover-overlay { opacity: 1; }
        .camera-badge:hover { transform: scale(1.1) !important; background: #8B5CF6 !important; }
        .prof-inp:focus { border-color: #7C3AED !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.15) !important; }
      `}</style>

      {/* Hidden File Input for Avatar */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAvatarFileSelect}
      />

      {/* Header */}
      <div style={{ marginBottom: '24px' }} className="page-fade">
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#F9FAFB', margin: '0 0 4px', letterSpacing: '-0.3px' }}>My Profile</h1>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
          Manage your full name, skills, credentials, and profile photo
        </p>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="toast-notif" style={s.toast}>{toast}</div>
      )}

      {/* Main Profile Card */}
      <div style={s.profileCard} className="page-fade-2">
        <div style={s.banner} />

        <div style={{ padding: '0 28px 28px' }}>
          <div style={s.avatarRow}>
            {/* Avatar with Overlay & Upload Camera Icon */}
            <div
              className="avatar-container"
              style={{ position: 'relative', width: '92px', height: '92px', cursor: 'pointer' }}
              onClick={() => avatarInputRef.current?.click()}
              title="Click to Change Profile Picture"
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt={fullName} style={s.avatarImg} />
              ) : (
                <div style={s.avatarPlaceholder}>{getInitials()}</div>
              )}

              {uploadingAvatar ? (
                <div style={s.uploadSpinnerOverlay}>
                  <div style={s.spinner} />
                </div>
              ) : (
                <>
                  <div className="avatar-hover-overlay">
                    <span style={{ fontSize: '20px' }}>📷</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, marginTop: '2px' }}>Upload</span>
                  </div>
                  <div className="camera-badge" style={s.cameraBadge} title="Upload Photo">
                    📷
                  </div>
                </>
              )}
            </div>

            {/* Edit / Save Action Buttons */}
            <div>
              {editing ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => { setEditing(false); setForm(profile || {}); }}
                    style={s.outlineBtn}
                  >
                    Cancel
                  </button>
                  <button onClick={handleSave} style={s.primaryBtn}>
                    💾 Save Changes
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditing(true)} style={s.primaryBtn}>
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* User Meta Summary */}
          <div style={{ marginBottom: '24px' }}>
            {editing ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', maxWidth: '500px', marginBottom: '12px' }}>
                <div>
                  <label style={s.labelStyle}>First Name *</label>
                  <input
                    className="prof-inp"
                    style={s.inputStyle}
                    value={form.firstName || ''}
                    onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                    placeholder="e.g. Anirudh"
                  />
                </div>
                <div>
                  <label style={s.labelStyle}>Last Name *</label>
                  <input
                    className="prof-inp"
                    style={s.inputStyle}
                    value={form.lastName || ''}
                    onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                    placeholder="e.g. Raut"
                  />
                </div>
              </div>
            ) : (
              <h2 style={s.userNameText}>{fullName}</h2>
            )}
            <p style={s.userEmailText}>{user.email}</p>
            <span
              style={{
                ...s.roleBadge,
                background: isFreelancer ? 'rgba(124,58,237,0.15)' : 'rgba(59,130,246,0.15)',
                color: isFreelancer ? '#A855F7' : '#60A5FA',
                borderColor: isFreelancer ? 'rgba(124,58,237,0.3)' : 'rgba(59,130,246,0.3)',
              }}
            >
              {isFreelancer ? '⚡ FREELANCER' : '🏢 CLIENT'}
            </span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #2D2D3F', margin: '20px 0' }} />

          {/* Bio */}
          <div style={{ marginBottom: '20px' }}>
            <label style={s.labelStyle}>Bio</label>
            {editing ? (
              <textarea
                className="prof-inp"
                rows={3}
                style={s.textareaStyle}
                value={form.bio || ''}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                placeholder="Tell clients or team members about your experience and background..."
              />
            ) : (
              <p style={{ ...s.valueStyle, color: profile?.bio ? '#E5E7EB' : '#6B7280', fontStyle: profile?.bio ? 'normal' : 'italic' }}>
                {profile?.bio || 'No bio added yet. Click "Edit Profile" to add your bio.'}
              </p>
            )}
          </div>

          {/* ── Freelancer Fields ── */}
          {isFreelancer && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Skills */}
              <div style={{ gridColumn: '1/-1' }}>
                <label style={s.labelStyle}>Skills (Comma-Separated)</label>
                {editing ? (
                  <input
                    className="prof-inp"
                    style={s.inputStyle}
                    value={form.skills || ''}
                    onChange={e => setForm(p => ({ ...p, skills: e.target.value }))}
                    placeholder="React, Java, Spring Boot, MySQL..."
                  />
                ) : (
                  <div>
                    {profile?.skills ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                        {profile.skills.split(',').map((skill, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: 'rgba(124,58,237,0.15)',
                              color: '#A855F7',
                              border: '1px solid rgba(124,58,237,0.3)',
                              padding: '5px 14px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 700,
                              letterSpacing: '0.3px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            ⚡ {skill.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ ...s.valueStyle, color: '#6B7280', fontStyle: 'italic' }}>— No skills added yet. Click "Edit Profile" to add your skills.</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label style={s.labelStyle}>Hourly Rate (₹/hr)</label>
                {editing ? (
                  <input
                    className="prof-inp"
                    type="number"
                    style={s.inputStyle}
                    value={form.hourlyRate || ''}
                    onChange={e => setForm(p => ({ ...p, hourlyRate: e.target.value }))}
                    placeholder="e.g. 25"
                  />
                ) : (
                  <p style={s.valueStyle}>{profile?.hourlyRate ? `₹${profile.hourlyRate}/hr` : '—'}</p>
                )}
              </div>

              <div>
                <label style={s.labelStyle}>Portfolio URL</label>
                {editing ? (
                  <input
                    className="prof-inp"
                    style={s.inputStyle}
                    value={form.portfolioUrl || ''}
                    onChange={e => setForm(p => ({ ...p, portfolioUrl: e.target.value }))}
                    placeholder="https://yourportfolio.com"
                  />
                ) : (
                  <p style={s.valueStyle}>
                    {profile?.portfolioUrl ? (
                      <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: '#A855F7', fontWeight: 600 }}>
                        {profile.portfolioUrl}
                      </a>
                    ) : '—'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Client Fields ── */}
          {isClient && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={s.labelStyle}>Company Name</label>
                {editing ? (
                  <input className="prof-inp" style={s.inputStyle} value={form.companyName || ''} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} placeholder="Acme Corp" />
                ) : (
                  <p style={s.valueStyle}>{profile?.companyName || '—'}</p>
                )}
              </div>

              <div>
                <label style={s.labelStyle}>Industry</label>
                {editing ? (
                  <input className="prof-inp" style={s.inputStyle} value={form.industry || ''} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))} placeholder="Technology, Finance..." />
                ) : (
                  <p style={s.valueStyle}>{profile?.industry || '—'}</p>
                )}
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={s.labelStyle}>Company Website</label>
                {editing ? (
                  <input className="prof-inp" style={s.inputStyle} value={form.website || ''} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://company.com" />
                ) : (
                  <p style={s.valueStyle}>
                    {profile?.website ? (
                      <a href={profile.website} target="_blank" rel="noreferrer" style={{ color: '#A855F7', fontWeight: 600 }}>
                        {profile.website}
                      </a>
                    ) : '—'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Certifications (Freelancer only) ── */}
      {isFreelancer && (
        <div className="page-fade-3">
          <CertificationsList userId={userId} />
        </div>
      )}
    </div>
  );
}

const s = {
  toast: {
    position: 'fixed', top: '80px', right: '24px', zIndex: 9999,
    background: '#1A1B26', border: '1px solid #2D2D3F', color: '#F9FAFB',
    padding: '14px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  profileCard: {
    background: '#13141C', borderRadius: '20px',
    border: '1px solid #2D2D3F', overflow: 'hidden',
    marginBottom: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  },
  banner: {
    height: '110px',
    background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
  },
  avatarRow: {
    display: 'flex', alignItems: 'flex-end',
    justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
    marginTop: '-44px', marginBottom: '16px',
  },
  avatarImg: {
    width: '92px', height: '92px', borderRadius: '50%',
    border: '4px solid #13141C', objectFit: 'cover',
    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
  },
  avatarPlaceholder: {
    width: '92px', height: '92px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
    border: '4px solid #13141C',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '32px', fontWeight: 800, color: '#fff',
    boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
  },
  cameraBadge: {
    position: 'absolute', bottom: '2px', right: '2px',
    width: '30px', height: '30px', borderRadius: '50%',
    background: '#7C3AED', border: '2px solid #13141C',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    transition: 'all 0.2s ease',
  },
  uploadSpinnerOverlay: {
    position: 'absolute', inset: 0, borderRadius: '50%',
    background: 'rgba(9,10,15,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  spinner: {
    width: '20px', height: '20px',
    border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  },
  userNameText: { fontSize: '22px', fontWeight: 800, color: '#F9FAFB', margin: '0 0 4px', letterSpacing: '-0.3px' },
  userEmailText: { color: '#6B7280', fontSize: '13px', margin: '0 0 10px' },
  roleBadge: {
    padding: '4px 14px', borderRadius: '20px', border: '1px solid',
    fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'inline-block',
  },
  labelStyle: { display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6B7280', marginBottom: '6px' },
  valueStyle: { fontSize: '14px', color: '#E5E7EB', margin: 0 },
  inputStyle: { width: '100%', padding: '10px 14px', background: '#0D0E15', border: '1.5px solid #2D2D3F', borderRadius: '10px', fontSize: '14px', outline: 'none', color: '#F9FAFB', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  textareaStyle: { width: '100%', padding: '10px 14px', background: '#0D0E15', border: '1.5px solid #2D2D3F', borderRadius: '10px', fontSize: '14px', outline: 'none', color: '#F9FAFB', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.2s', resize: 'vertical' },
  primaryBtn: { padding: '9px 20px', background: 'linear-gradient(135deg,#7C3AED,#6366F1)', color: '#F9FAFB', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(124,58,237,0.4)', fontFamily: 'Inter, sans-serif' },
  outlineBtn: { padding: '9px 20px', background: '#1A1B26', color: '#9CA3AF', border: '1px solid #2D2D3F', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
};