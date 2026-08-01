// src/components/common/Input.jsx
// Dark-themed input with neon purple focus ring
import React, { useState } from 'react';

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  icon,
  rightEl,
  error,
  style = {},
  rows,
  min,
  ...props
}) {
  const [focused, setFocused] = useState(false);

  const wrapStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: 600,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const inputWrapStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle = {
    width: '100%',
    padding: icon ? '11px 14px 11px 42px' : '11px 14px',
    paddingRight: rightEl ? '42px' : '14px',
    background: '#0D0E15',
    border: `1.5px solid ${focused ? '#7C3AED' : error ? '#EF4444' : '#2D2D3F'}`,
    borderRadius: '10px',
    color: '#F9FAFB',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.15)' : 'none',
    resize: rows ? 'vertical' : 'none',
    boxSizing: 'border-box',
    ...style,
  };

  const iconStyle = {
    position: 'absolute',
    left: '14px',
    color: focused ? '#7C3AED' : '#6B7280',
    fontSize: '16px',
    pointerEvents: 'none',
    transition: 'color 0.2s',
    lineHeight: 1,
  };

  const rightStyle = {
    position: 'absolute',
    right: '12px',
    color: '#6B7280',
  };

  const commonProps = {
    value,
    onChange,
    placeholder,
    required,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: inputStyle,
    min,
    ...props,
  };

  return (
    <div style={wrapStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      <div style={inputWrapStyle}>
        {icon && <span style={iconStyle}>{icon}</span>}
        {rows ? (
          <textarea type={type} rows={rows} {...commonProps} />
        ) : (
          <input type={type} {...commonProps} />
        )}
        {rightEl && <div style={rightStyle}>{rightEl}</div>}
      </div>
      {error && (
        <span style={{ fontSize: '12px', color: '#EF4444' }}>{error}</span>
      )}
    </div>
  );
}

// Select variant
export function Select({ label, value, onChange, children, style = {} }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '11px 14px',
          background: '#0D0E15',
          border: `1.5px solid ${focused ? '#7C3AED' : '#2D2D3F'}`,
          borderRadius: '10px',
          color: '#F9FAFB',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          outline: 'none',
          boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.15)' : 'none',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          ...style,
        }}
      >
        {children}
      </select>
    </div>
  );
}
