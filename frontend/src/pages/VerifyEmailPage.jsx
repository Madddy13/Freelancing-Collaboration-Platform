import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing email verification token.');
      return;
    }

    API.get(`/auth/verify-email?token=${token}`)
      .then(res => {
        setStatus('success');
        setMessage(res.data?.message || 'Email verified successfully!');
        setTimeout(() => navigate('/login'), 2500);
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification token is invalid or has expired.');
      });
  }, [token, navigate]);

  return (
    <div style={s.page}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .verify-card{animation:fadeUp 0.5s ease both;}
      `}</style>

      <div style={s.card} className="verify-card">
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          {status === 'verifying' ? '⏳' : status === 'success' ? '✅' : '❌'}
        </div>

        <h2 style={s.title}>
          {status === 'verifying' ? 'Verifying Email...' : status === 'success' ? 'Email Verified!' : 'Verification Failed'}
        </h2>

        <p style={s.sub}>{message}</p>

        {status === 'verifying' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <div style={s.spinner} />
          </div>
        )}

        {status === 'success' && (
          <p style={{ fontSize: '13px', color: '#10B981', marginTop: '12px' }}>
            Redirecting to login in 2 seconds...
          </p>
        )}

        <div style={{ marginTop: '24px' }}>
          <Link to="/login" style={s.btn}>Go to Login →</Link>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh', width: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#090A0F', fontFamily: 'Inter, sans-serif', padding: '20px',
  },
  card: {
    background: '#13141C', border: '1px solid #2D2D3F',
    borderRadius: '24px', padding: '40px 32px',
    maxWidth: '440px', width: '100%', textAlign: 'center',
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
  },
  title: { fontSize: '22px', fontWeight: 800, color: '#F9FAFB', margin: '0 0 8px' },
  sub: { fontSize: '14px', color: '#9CA3AF', margin: 0, lineHeight: 1.6 },
  btn: {
    display: 'inline-block', padding: '12px 24px',
    background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
    color: '#fff', borderRadius: '10px', fontWeight: 700,
    fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
  },
  spinner: {
    width: '24px', height: '24px',
    border: '3px solid rgba(124,58,237,0.2)', borderTopColor: '#7C3AED',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  },
};
