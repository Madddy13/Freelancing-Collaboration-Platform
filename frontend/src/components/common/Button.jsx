// src/components/common/Button.jsx
// Reusable Button — supports: primary | secondary | ghost | danger | outline variants
import React from 'react';

const variants = {
  primary: {
    background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
    color: '#F9FAFB',
    border: 'none',
    boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
  },
  secondary: {
    background: 'rgba(124,58,237,0.12)',
    color: '#A855F7',
    border: '1px solid rgba(124,58,237,0.3)',
  },
  ghost: {
    background: 'transparent',
    color: '#9CA3AF',
    border: '1px solid #2D2D3F',
  },
  danger: {
    background: 'rgba(239,68,68,0.12)',
    color: '#EF4444',
    border: '1px solid rgba(239,68,68,0.25)',
  },
  success: {
    background: 'rgba(16,185,129,0.12)',
    color: '#10B981',
    border: '1px solid rgba(16,185,129,0.25)',
  },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  style = {},
  className = '',
  ...props
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    borderRadius: '10px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
    whiteSpace: 'nowrap',
    width: fullWidth ? '100%' : 'auto',
    fontSize: size === 'sm' ? '12px' : size === 'lg' ? '16px' : '14px',
    padding: size === 'sm' ? '7px 14px' : size === 'lg' ? '14px 28px' : '10px 20px',
    ...variants[variant],
    ...style,
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={base}
      className={className}
      onMouseEnter={e => {
        if (!disabled) {
          if (variant === 'primary') {
            e.currentTarget.style.background = 'linear-gradient(135deg, #6D28D9, #4F46E5)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.5)';
          } else {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.borderColor = '#7C3AED';
          }
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          e.currentTarget.style.transform = '';
          if (variant === 'primary') {
            e.currentTarget.style.background = 'linear-gradient(135deg, #7C3AED, #6366F1)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(124,58,237,0.35)';
          }
          e.currentTarget.style.borderColor = variants[variant].border?.split(' ')[1] || '';
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
}
