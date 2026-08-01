// src/components/profile/CertificationsList.jsx
// Dark Obsidian & Electric Purple Certifications Manager with Fail-safe PDF Upload & String Date Compatibility

import React, { useEffect, useState } from 'react';
import API from '../../api/axiosInstance';
import Card from '../common/Card';
import Badge from '../common/Badge';

const empty = { title: '', organization: '', issueDate: '', credentialId: '', credentialUrl: '', certificatePdfUrl: '' };

export default function CertificationsList({ userId }) {
  const [certs, setCerts]                 = useState([]);
  const [showForm, setShowForm]           = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [form, setForm]                   = useState(empty);
  const [loading, setLoading]             = useState(true);
  const [uploadingPdf, setUploadingPdf]   = useState(false);

  useEffect(() => {
    if (userId) {
      API.get(`/users/certifications/${userId}`)
        .then(r => setCerts(Array.isArray(r.data) ? r.data : []))
        .catch(() => setCerts([]))
        .finally(() => setLoading(false));
    }
  }, [userId]);

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await API.post('/users/certifications/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setForm(prev => ({ ...prev, certificatePdfUrl: res.data.pdfUrl }));
    } catch {
      // Fail-safe Fallback: Read file as Data URL locally if server endpoint is busy
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, certificatePdfUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.title || !form.organization) {
      alert('Title and Organization are required.');
      return;
    }
    try {
      const payload = {
        title: form.title,
        organization: form.organization,
        issueDate: form.issueDate ? String(form.issueDate) : '',
        credentialId: form.credentialId || '',
        credentialUrl: form.credentialUrl || '',
        certificatePdfUrl: form.certificatePdfUrl || '',
      };

      if (editingId) {
        const res = await API.put(`/users/certifications/${editingId}`, payload);
        setCerts(certs.map(c => c.id === editingId ? res.data : c));
      } else {
        const res = await API.post(`/users/certifications/${userId}`, payload);
        setCerts([...certs, res.data]);
      }
      setForm(empty);
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save certification: ' + (err.response?.data?.message || err.message || 'Server error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this certification?')) return;
    try {
      await API.delete(`/users/certifications/${id}`);
      setCerts(certs.filter(c => c.id !== id));
    } catch {
      alert('Failed to delete certification.');
    }
  };

  const startEdit = (cert) => {
    setForm(cert);
    setEditingId(cert.id);
    setShowForm(true);
  };

  return (
    <Card padding="28px" style={{ marginTop: '24px' }}>
      <style>{`
        .cert-card { transition: all 0.2s ease !important; }
        .cert-card:hover { border-color: rgba(124,58,237,0.4) !important; transform: translateY(-1px); }
        .cert-inp:focus { border-color: #7C3AED !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.15) !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#F9FAFB', margin: '0 0 4px' }}>🎓 Certifications</h3>
          <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>Showcase your verified industry credentials and attached PDF documents</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(empty); }}
          style={{
            padding: '8px 16px', background: showForm ? '#1A1B26' : 'rgba(124,58,237,0.15)',
            color: showForm ? '#9CA3AF' : '#A855F7',
            border: `1px solid ${showForm ? '#2D2D3F' : 'rgba(124,58,237,0.3)'}`,
            borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
          }}
        >
          {showForm ? '✕ Cancel' : '+ Add Certification'}
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: '#0D0E15', borderRadius: '14px', padding: '20px',
          border: '1px solid #2D2D3F', marginBottom: '20px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px',
        }}>
          {/* Title */}
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Certification Title *
            </label>
            <input
              className="cert-inp"
              placeholder="e.g. AWS Certified Solutions Architect"
              value={form.title || ''}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              style={s.input}
            />
          </div>

          {/* Organization */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Issuing Organization *
            </label>
            <input
              className="cert-inp"
              placeholder="e.g. Amazon Web Services"
              value={form.organization || ''}
              onChange={e => setForm(p => ({ ...p, organization: e.target.value }))}
              style={s.input}
            />
          </div>

          {/* Dual Manual Typing + Calendar Picker Date Input */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Issue Date (Type or Pick)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                className="cert-inp"
                placeholder="YYYY-MM-DD or DD-MM-YYYY"
                value={form.issueDate || ''}
                onChange={e => setForm(p => ({ ...p, issueDate: e.target.value }))}
                style={{ ...s.input, paddingRight: '40px' }}
              />
              <input
                type="date"
                style={{
                  position: 'absolute', right: '8px', opacity: 0, width: '32px', height: '32px', cursor: 'pointer'
                }}
                onChange={e => setForm(p => ({ ...p, issueDate: e.target.value }))}
              />
              <span style={{ position: 'absolute', right: '12px', pointerEvents: 'none', fontSize: '16px' }}>📅</span>
            </div>
          </div>

          {/* Credential ID */}
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Credential ID
            </label>
            <input
              className="cert-inp"
              placeholder="Optional ID e.g. AWS-12345"
              value={form.credentialId || ''}
              onChange={e => setForm(p => ({ ...p, credentialId: e.target.value }))}
              style={s.input}
            />
          </div>

          {/* Credential Verification URL */}
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Credential Verification URL
            </label>
            <input
              className="cert-inp"
              placeholder="https://..."
              value={form.credentialUrl || ''}
              onChange={e => setForm(p => ({ ...p, credentialUrl: e.target.value }))}
              style={s.input}
            />
          </div>

          {/* Certificate PDF File Upload */}
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Attach Certificate PDF Document (Permanent Storage)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handlePdfUpload}
                style={{
                  flex: 1, padding: '9px 12px', background: '#13141C',
                  border: '1.5px solid #2D2D3F', borderRadius: '10px',
                  color: '#F9FAFB', fontSize: '13px', fontFamily: 'Inter, sans-serif',
                }}
              />
              {uploadingPdf && <span style={{ fontSize: '12px', color: '#A855F7', fontWeight: 600 }}>⏳ Uploading PDF...</span>}
            </div>
            {form.certificatePdfUrl && (
              <div style={{ marginTop: '8px' }}>
                <a
                  href={form.certificatePdfUrl.startsWith('data:') ? form.certificatePdfUrl : `${process.env.REACT_APP_API_BASE || 'http://localhost:8080'}${form.certificatePdfUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '12px', color: '#34D399', fontWeight: 600, textDecoration: 'none' }}
                >
                  ✓ Certificate PDF Attached (Click to Preview)
                </a>
              </div>
            )}
          </div>

          <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(empty); setEditingId(null); }}
              style={{ padding: '9px 18px', background: '#1A1B26', color: '#6B7280', border: '1px solid #2D2D3F', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >Cancel</button>
            <button
              type="submit"
              style={{
                padding: '9px 22px', background: 'linear-gradient(135deg,#7C3AED,#6366F1)',
                color: '#F9FAFB', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 14px rgba(124,58,237,0.4)', fontFamily: 'Inter, sans-serif',
              }}
            >
              {editingId ? '💾 Save Changes' : '🚀 Add Certification'}
            </button>
          </div>
        </form>
      )}

      {/* Certification List */}
      {loading ? (
        <p style={{ color: '#6B7280', fontSize: '13px' }}>Loading certifications...</p>
      ) : certs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 20px', background: '#0D0E15', borderRadius: '12px', border: '1px dashed #2D2D3F' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>📜</div>
          <p style={{ color: '#F9FAFB', fontWeight: 600, margin: '0 0 4px' }}>No Certifications Added</p>
          <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>Add your certificates, licenses, and verified credentials to boost client trust.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {certs.map(cert => (
            <div key={cert.id} className="cert-card" style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              padding: '16px 20px', borderRadius: '12px', background: '#0D0E15', border: '1px solid #2D2D3F',
            }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', flexShrink: 0,
                }}>🏅</div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '15px', color: '#F9FAFB', margin: '0 0 2px' }}>{cert.title}</h4>
                  <p style={{ color: '#A855F7', fontSize: '13px', fontWeight: 600, margin: '0 0 6px' }}>{cert.organization}</p>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {cert.issueDate && (
                      <span style={{ color: '#6B7280', fontSize: '12px' }}>
                        📅 Issued {cert.issueDate}
                      </span>
                    )}
                    {cert.credentialId && (
                      <Badge color="gray">ID: {cert.credentialId}</Badge>
                    )}
                    {cert.credentialUrl && (
                      <a href={cert.credentialUrl} target="_blank" rel="noreferrer"
                        style={{ fontSize: '12px', color: '#60A5FA', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        🔗 View Credential
                      </a>
                    )}
                    {cert.certificatePdfUrl && (
                      <a href={cert.certificatePdfUrl.startsWith('data:') ? cert.certificatePdfUrl : `${process.env.REACT_APP_API_BASE || 'http://localhost:8080'}${cert.certificatePdfUrl}`}
                        target="_blank" rel="noreferrer"
                        style={{
                          padding: '4px 10px', background: 'rgba(52,211,153,0.12)',
                          color: '#34D399', border: '1px solid rgba(52,211,153,0.3)',
                          borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px',
                        }}>
                        📄 View Certificate PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button onClick={() => startEdit(cert)} title="Edit" style={{ background: '#1A1B26', border: '1px solid #2D2D3F', color: '#A855F7', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', cursor: 'pointer' }}>✏️</button>
                <button onClick={() => handleDelete(cert.id)} title="Delete" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', cursor: 'pointer' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

const s = {
  input: {
    width: '100%', padding: '10px 14px', background: '#13141C',
    border: '1.5px solid #2D2D3F', borderRadius: '10px',
    color: '#F9FAFB', fontSize: '14px', fontFamily: 'Inter, sans-serif',
    outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
  }
};