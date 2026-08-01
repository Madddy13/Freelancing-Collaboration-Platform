// src/components/common/Card.jsx
// Glassmorphism dark card container with optional hover elevation
import React from 'react';

export default function Card({
  children,
  style = {},
  hover = true,
  glow = false,
  padding = '24px',
  className = '',
  onClick,
}) {
  const base = {
    background: '#13141C',
    border: `1px solid ${glow ? 'rgba(124,58,237,0.35)' : '#2D2D3F'}`,
    borderRadius: '16px',
    padding,
    position: 'relative',
    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: glow ? '0 0 24px rgba(124,58,237,0.1)' : '0 1px 3px rgba(0,0,0,0.3)',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  return (
    <div
      className={className}
      style={base}
      onClick={onClick}
      onMouseEnter={e => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,58,237,0.15)';
        }
      }}
      onMouseLeave={e => {
        if (hover) {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.borderColor = glow ? 'rgba(124,58,237,0.35)' : '#2D2D3F';
          e.currentTarget.style.boxShadow = glow ? '0 0 24px rgba(124,58,237,0.1)' : '0 1px 3px rgba(0,0,0,0.3)';
        }
      }}
    >
      {children}
    </div>
  );
}
