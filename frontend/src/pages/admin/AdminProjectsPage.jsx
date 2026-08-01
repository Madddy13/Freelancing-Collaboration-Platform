import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects/all');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (projectId, currentStatus) => {
    const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await api.put(`/projects/${projectId}/status?status=${newStatus}`);
      fetchProjects();
    } catch (err) {
      console.error('Failed to update project status', err);
    }
  };

  return (
    <div style={{ padding: '24px', color: '#F9FAFB' }}>
      <h2>Manage Projects</h2>
      {loading ? <p>Loading projects...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2D2D3F', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Title</th>
              <th>Client ID</th>
              <th>Budget</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #1A1B26' }}>
                <td style={{ padding: '12px' }}>{p.title}</td>
                <td>{p.clientId}</td>
                <td>₹{p.budget}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '12px', fontSize: '12px',
                    background: p.status === 'OPEN' ? '#10B98133' : '#6B728033',
                    color: p.status === 'OPEN' ? '#10B981' : '#9CA3AF'
                  }}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => updateStatus(p.id, p.status)}
                    style={{
                      padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                      background: '#374151', color: '#fff'
                    }}
                  >
                    Toggle Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
