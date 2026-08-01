import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';

export default function AdminReportsPage() {
  const [stats, setStats] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, reportsRes] = await Promise.all([
        api.get('/reports/platform-stats').catch(() => ({ data: null })),
        api.get('/reports/user-reports').catch(() => ({ data: [] }))
      ]);
      setStats(statsRes.data);
      setUserReports(reportsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch report data', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleReportStatus = async (reportId, currentStatus) => {
    const newStatus = currentStatus === 'RESOLVED' ? 'PENDING' : 'RESOLVED';
    try {
      await api.put(`/reports/user-reports/${reportId}/status?status=${newStatus}`);
      fetchData();
    } catch (err) {
      console.error('Failed to update report status', err);
    }
  };

  if (loading) return <div style={{ padding: '24px', color: '#fff' }}>Loading platform reports...</div>;

  return (
    <div style={{ padding: '24px', color: '#F9FAFB' }}>
      <h2 style={{ marginBottom: '24px' }}>Platform Reports & User Tickets</h2>
      
      {/* KPI Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '36px' }}>
          
          <div style={{ padding: '20px', background: '#13141C', borderRadius: '12px', border: '1px solid #2D2D3F' }}>
            <h4 style={{ color: '#9CA3AF', margin: '0 0 10px 0' }}>Total Projects</h4>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3B82F6' }}>{stats.totalProjects}</div>
          </div>
          
          <div style={{ padding: '20px', background: '#13141C', borderRadius: '12px', border: '1px solid #2D2D3F' }}>
            <h4 style={{ color: '#9CA3AF', margin: '0 0 10px 0' }}>Open Projects</h4>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10B981' }}>{stats.openProjects}</div>
          </div>
          
          <div style={{ padding: '20px', background: '#13141C', borderRadius: '12px', border: '1px solid #2D2D3F' }}>
            <h4 style={{ color: '#9CA3AF', margin: '0 0 10px 0' }}>Completed Projects</h4>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8B5CF6' }}>{stats.completedProjects}</div>
          </div>
          
          <div style={{ padding: '20px', background: '#13141C', borderRadius: '12px', border: '1px solid #2D2D3F' }}>
            <h4 style={{ color: '#9CA3AF', margin: '0 0 10px 0' }}>Total Budget Volume</h4>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F59E0B' }}>₹{stats.totalRevenue?.toLocaleString()}</div>
          </div>

        </div>
      )}

      {/* User Submitted Tickets Section */}
      <div style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Submitted User Tickets & Incident Reports</h3>
            <p style={{ margin: '4px 0 0 0', color: '#9CA3AF', fontSize: '13px' }}>
              Issues reported by Clients and Freelancers requiring Admin resolution
            </p>
          </div>
          <button
            onClick={fetchData}
            style={{ padding: '6px 14px', background: '#13141C', border: '1px solid #2D2D3F', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '12px' }}
          >
            🔄 Refresh
          </button>
        </div>

        {userReports.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#13141C', borderRadius: '12px', border: '1px solid #2D2D3F', color: '#9CA3AF' }}>
            No user reports submitted yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: '#13141C', borderRadius: '12px', border: '1px solid #2D2D3F' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2D2D3F', background: '#0D0E15', color: '#9CA3AF', fontSize: '13px' }}>
                  <th style={{ padding: '14px 16px' }}>Sender</th>
                  <th style={{ padding: '14px 16px' }}>Subject</th>
                  <th style={{ padding: '14px 16px' }}>Description</th>
                  <th style={{ padding: '14px 16px' }}>Date</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Resolution</th>
                </tr>
              </thead>
              <tbody>
                {userReports.map(rep => {
                  const roleLabel = rep.senderRole === 'ROLE_CLIENT' ? 'Client' : rep.senderRole === 'ROLE_FREELANCER' ? 'Freelancer' : 'User';
                  const roleBg = rep.senderRole === 'ROLE_CLIENT' ? 'rgba(16,185,129,0.15)' : 'rgba(124,58,237,0.15)';
                  const roleColor = rep.senderRole === 'ROLE_CLIENT' ? '#10B981' : '#A855F7';
                  const isResolved = rep.status === 'RESOLVED';

                  return (
                    <tr key={rep.id} style={{ borderBottom: '1px solid #1A1B26' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '600', color: '#F9FAFB', fontSize: '14px' }}>{rep.senderEmail || 'Anonymous'}</div>
                        <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', background: roleBg, color: roleColor, display: 'inline-block', marginTop: '4px' }}>
                          {roleLabel}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '600', color: '#F9FAFB', fontSize: '14px', maxWidth: '180px' }}>
                        {rep.subject}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#9CA3AF', fontSize: '13px', maxWidth: '300px', lineHeight: '1.5' }}>
                        {rep.description}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#6B7280', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {rep.createdAt ? new Date(rep.createdAt).toLocaleString() : 'Recently'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700',
                          background: isResolved ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                          color: isResolved ? '#10B981' : '#F59E0B',
                          border: `1px solid ${isResolved ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`
                        }}>
                          {isResolved ? '✓ RESOLVED' : '⏳ PENDING'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => toggleReportStatus(rep.id, rep.status)}
                          style={{
                            padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            fontSize: '12px', fontWeight: '600', transition: 'all 0.2s',
                            background: isResolved ? '#374151' : '#10B981',
                            color: '#fff'
                          }}
                        >
                          {isResolved ? 'Mark Pending' : 'Mark Resolved'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
