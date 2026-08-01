// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axiosInstance';
import Logo from '../components/ui/Logo';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [done, setDone]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    setLoading(true); setError('');
    try {
      await API.post('/auth/reset-password', { token, newPassword });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '40px',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Logo dark={false} />
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '20px 0 4px' }}>
            Create New Password
          </h2>
        </div>

        {done ? (
          <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
            <p style={{ color: '#065f46', fontWeight: 600, margin: 0 }}>Password reset successfully!</p>
            <p style={{ color: '#047857', fontSize: '13px', marginTop: '4px' }}>Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '12px', color: '#b91c1c', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}
            {['New Password', 'Confirm Password'].map((label, i) => (
              <div key={label} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                  {label.toUpperCase()}
                </label>
                <input
                  type="password"
                  value={i === 0 ? newPassword : confirmPassword}
                  onChange={e => i === 0 ? setNewPassword(e.target.value) : setConfirmPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  style={{
                    width: '100%', padding: '12px 16px',
                    border: '1px solid #e2e8f0', borderRadius: '10px',
                    fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
            <button type="submit" disabled={loading || !token} style={{
              width: '100%', padding: '13px',
              background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
              color: '#fff', border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            }}>
              {loading ? 'Resetting...' : '🔑 Reset Password'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748b' }}>
          <Link to="/login" style={{ color: '#6366f1', fontWeight: 600 }}>← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}