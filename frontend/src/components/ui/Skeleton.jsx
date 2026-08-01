// src/components/ui/Skeleton.jsx
// Skeleton loader components to prevent layout shifts during data fetching.

import React from 'react';

const shimmer = `
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
`;

const shimmerStyle = {
  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
  backgroundSize: '600px 100%',
  animation: 'shimmer 1.4s ease-in-out infinite',
  borderRadius: '8px',
};

// Inject keyframe once
function injectShimmer() {
  if (!document.getElementById('skeleton-shimmer-style')) {
    const style = document.createElement('style');
    style.id = 'skeleton-shimmer-style';
    style.textContent = shimmer;
    document.head.appendChild(style);
  }
}

// Base Skeleton Block
export function SkeletonBlock({ width = '100%', height = '16px', radius = '8px', style = {} }) {
  injectShimmer();
  return (
    <div style={{ ...shimmerStyle, width, height, borderRadius: radius, ...style }} />
  );
}

// Text line skeleton
export function SkeletonText({ lines = 3, lastWidth = '60%' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          height="14px"
          width={i === lines - 1 ? lastWidth : '100%'}
        />
      ))}
    </div>
  );
}

// Avatar skeleton
export function SkeletonAvatar({ size = 48 }) {
  return (
    <SkeletonBlock
      width={`${size}px`}
      height={`${size}px`}
      radius="50%"
      style={{ flexShrink: 0 }}
    />
  );
}

// Full card skeleton (matches project/team card dimensions)
export function SkeletonCard({ height = '200px' }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '14px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column', gap: '14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <SkeletonAvatar size={44} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonBlock height="16px" width="55%" />
          <SkeletonBlock height="12px" width="35%" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <SkeletonBlock height="32px" width="100px" radius="20px" />
        <SkeletonBlock height="32px" width="80px" radius="20px" />
      </div>
    </div>
  );
}

// Dashboard stats skeleton
export function SkeletonStats() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: '16px' }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{
          background: '#fff', borderRadius: '14px', padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', gap: '10px'
        }}>
          <SkeletonBlock height="13px" width="50%" />
          <SkeletonBlock height="32px" width="40%" />
          <SkeletonBlock height="11px" width="65%" />
        </div>
      ))}
    </div>
  );
}

// Profile page skeleton
export function SkeletonProfile() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <SkeletonAvatar size={90} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SkeletonBlock height="22px" width="40%" />
          <SkeletonBlock height="14px" width="25%" />
          <SkeletonBlock height="28px" width="120px" radius="20px" />
        </div>
      </div>
      <SkeletonText lines={4} />
    </div>
  );
}