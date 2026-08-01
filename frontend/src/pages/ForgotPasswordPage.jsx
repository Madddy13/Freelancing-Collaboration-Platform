// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axiosInstance';
import Logo from '../components/ui/Logo';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await API.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
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
            Forgot Password?
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Enter your email to receive a password reset link.
          </p>
        </div>

        {sent ? (
          <div style={{
            background: '#d1fae5', border: '1px solid #6ee7b7',
            borderRadius: '12px', padding: '20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📬</div>
            <p style={{ color: '#065f46', fontWeight: 600, margin: 0 }}>Email sent!</p>
            <p style={{ color: '#047857', fontSize: '13px', marginTop: '4px' }}>
              Check your inbox for the password reset link. It expires in 30 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '12px', color: '#b91c1c', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%', padding: '12px 16px',
                  border: '1px solid #e2e8f0', borderRadius: '10px',
                  fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
              color: '#fff', border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Sending...' : '📧 Send Reset Link'}
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