// src/components/common/Badge.jsx
// Pill badge with color variants matching the dark theme
import React from 'react';

const colorMap = {
  purple:  { bg: 'rgba(124,58,237,0.15)',  color: '#A855F7', border: 'rgba(124,58,237,0.3)'  },
  blue:    { bg: 'rgba(59,130,246,0.12)',   color: '#60A5FA', border: 'rgba(59,130,246,0.3)'  },
  green:   { bg: 'rgba(16,185,129,0.12)',   color: '#34D399', border: 'rgba(16,185,129,0.3)'  },
  yellow:  { bg: 'rgba(245,158,11,0.12)',   color: '#FBBF24', border: 'rgba(245,158,11,0.3)'  },
  red:     { bg: 'rgba(239,68,68,0.12)',    color: '#F87171', border: 'rgba(239,68,68,0.3)'   },
  gray:    { bg: 'rgba(107,114,128,0.15)',  color: '#9CA3AF', border: 'rgba(107,114,128,0.3)' },
  teal:    { bg: 'rgba(20,184,166,0.12)',   color: '#2DD4BF', border: 'rgba(20,184,166,0.3)'  },
};

export default function Badge({ children, color = 'purple', style = {} }) {
  const c = colorMap[color] || colorMap.purple;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 10px',
      borderRadius: '9999px',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.3px',
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {children}
    </span>
  );
}
