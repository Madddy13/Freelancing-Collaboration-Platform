import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';

export default function AdminActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      // Fetch recent projects and users to generate platform activity feed
      const [projectsRes, usersRes] = await Promise.all([
        api.get('/projects/all').catch(() => ({ data: [] })),
        api.get('/admin/users').catch(() => ({ data: [] }))
      ]);

      const projectLogs = (projectsRes.data || []).map(p => ({
        id: `p-${p.id}`,
        type: 'PROJECT',
        title: `Project Posted: "${p.title}"`,
        subtitle: `Budget: ₹${p.budget || 0} • Status: ${p.status}`,
        timestamp: p.createdAt ? new Date(p.createdAt).toLocaleString() : 'Recently',
        icon: '📋',
        color: '#3B82F6'
      }));

      const userLogs = (usersRes.data || []).map(u => ({
        id: `u-${u.id}`,
        type: 'USER',
        title: `User Registered: ${u.firstName || ''} ${u.lastName || ''} (${u.email})`,
        subtitle: `Role: ${u.role} • Status: ${u.status || 'ACTIVE'}`,
        timestamp: u.createdAt ? new Date(u.createdAt).toLocaleString() : 'Recently',
        icon: '👤',
        color: '#10B981'
      }));

      const combined = [...projectLogs, ...userLogs];
      setActivities(combined);
    } catch (err) {
      console.error('Failed to load activity', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', color: '#F9FAFB' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Monitor Platform Activity</h2>
          <p style={{ color: '#9CA3AF', margin: '4px 0 0 0', fontSize: '14px' }}>
            Real-time feed of recent events across the platform
          </p>
        </div>
        <button
          onClick={fetchActivity}
          style={{
            padding: '8px 16px', background: '#2D2D3F', border: '1px solid #374151',
            borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          🔄 Refresh Feed
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#9CA3AF', padding: '20px 0' }}>Loading activity logs...</div>
      ) : activities.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#13141C', borderRadius: '12px', color: '#9CA3AF' }}>
          No platform activities logged yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activities.map(act => (
            <div
              key={act.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px 20px', background: '#13141C',
                borderRadius: '12px', border: '1px solid #2D2D3F'
              }}
            >
              <div
                style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  background: `${act.color}20`, color: act.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', flexShrink: 0
                }}
              >
                {act.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#F9FAFB' }}>
                  {act.title}
                </div>
                <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>
                  {act.subtitle}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                {act.timestamp}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
