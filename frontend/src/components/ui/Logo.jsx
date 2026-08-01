// src/components/ui/Logo.jsx
// Responsive SVG logo with compact/full and dark/light variants.

import React from 'react';

export default function Logo({ compact = false, dark = true, size = 34 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* SVG Icon Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="CollabLance logo icon"
        style={{ flexShrink: 0 }}
      >
        {/* Outer circle gradient background */}
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="12" fill="url(#logoGrad)" />
        {/* Stylized C + L letter mark */}
        <path
          d="M12 20C12 15.6 15.6 12 20 12C22.4 12 24.6 13 26.2 14.6L23.4 17.4C22.5 16.5 21.3 16 20 16C17.8 16 16 17.8 16 20C16 22.2 17.8 24 20 24C21.3 24 22.5 23.5 23.4 22.6L26.2 25.4C24.6 27 22.4 28 20 28C15.6 28 12 24.4 12 20Z"
          fill="white"
          fillOpacity="0.95"
        />
        {/* Lance/diagonal accent */}
        <path
          d="M25 12L30 20L25 28"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.7"
        />
      </svg>

      {/* Wordmark — hidden in compact mode */}
      {!compact && (
        <span style={{
          fontSize: '16px',
          fontWeight: 800,
          letterSpacing: '-0.4px',
          color: dark ? '#f8fafc' : '#0f172a',
          fontFamily: "'Inter', sans-serif",
          userSelect: 'none',
        }}>
          Collab<span style={{ color: '#6366f1' }}>Lance</span>
        </span>
      )}
    </div>
  );
}