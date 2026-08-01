import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      const nonAdminUsers = (res.data || []).filter(u => u.role !== 'ROLE_ADMIN');
      setUsers(nonAdminUsers);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      await api.put(`/admin/users/${userId}/status?status=${newStatus}`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const deleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to permanently remove user ${userEmail}?`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
      alert('Failed to delete user: ' + (err.response?.data || err.message));
    }
  };

  return (
    <div style={{ padding: '24px', color: '#F9FAFB' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Manage Users</h2>
          <p style={{ color: '#9CA3AF', margin: '4px 0 0 0', fontSize: '14px' }}>
            View, suspend, or permanently remove clients and freelancers
          </p>
        </div>
        <div style={{ fontSize: '14px', color: '#9CA3AF', background: '#13141C', padding: '6px 14px', borderRadius: '8px', border: '1px solid #2D2D3F' }}>
          Total Users: <strong style={{ color: '#7C3AED' }}>{users.length}</strong>
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#9CA3AF', padding: '20px 0' }}>Loading users...</div>
      ) : users.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#13141C', borderRadius: '12px', color: '#9CA3AF' }}>
          No registered users found.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#13141C', borderRadius: '12px', border: '1px solid #2D2D3F' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2D2D3F', background: '#0D0E15', color: '#9CA3AF', fontSize: '13px' }}>
                <th style={{ padding: '14px 16px' }}>Name</th>
                <th style={{ padding: '14px 16px' }}>Email</th>
                <th style={{ padding: '14px 16px' }}>Role</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const name = u.firstName 
                  ? `${u.firstName} ${u.lastName || ''}`.trim() 
                  : (u.name || u.email?.split('@')[0] || 'User');
                const roleLabel = u.role === 'ROLE_CLIENT' ? 'Client' : 'Freelancer';
                const roleBg = u.role === 'ROLE_CLIENT' ? 'rgba(16,185,129,0.15)' : 'rgba(124,58,237,0.15)';
                const roleColor = u.role === 'ROLE_CLIENT' ? '#10B981' : '#A855F7';

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #1A1B26' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#F9FAFB' }}>
                      {name}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#9CA3AF', fontSize: '14px' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                        background: roleBg, color: roleColor
                      }}>
                        {roleLabel}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                        background: u.status === 'SUSPENDED' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                        color: u.status === 'SUSPENDED' ? '#F87171' : '#10B981'
                      }}>
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => toggleUserStatus(u.id, u.status || 'ACTIVE')}
                          style={{
                            padding: '6px 12px', borderRadius: '6px', border: '1px solid #374151',
                            background: u.status === 'SUSPENDED' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                            color: u.status === 'SUSPENDED' ? '#10B981' : '#F59E0B',
                            cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                          }}
                        >
                          {u.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                        </button>
                        <button
                          onClick={() => deleteUser(u.id, u.email)}
                          style={{
                            padding: '6px 12px', borderRadius: '6px', border: 'none',
                            background: '#DC2626', color: '#fff',
                            cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                            display: 'inline-flex', alignItems: 'center', gap: '6px'
                          }}
                          title="Remove user permanently"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                          Remove User
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
