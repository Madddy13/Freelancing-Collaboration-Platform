import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await api.post('/categories', { name: newCatName, active: true });
      setNewCatName('');
      fetchCategories();
    } catch (err) {
      console.error('Failed to add category', err);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete category', err);
    }
  };

  return (
    <div style={{ padding: '24px', color: '#F9FAFB' }}>
      <h2>Manage Categories</h2>
      
      <form onSubmit={addCategory} style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        <input 
          type="text" 
          placeholder="New category name" 
          value={newCatName} 
          onChange={e => setNewCatName(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #374151', background: '#13141C', color: '#fff' }}
        />
        <button type="submit" style={{ padding: '8px 16px', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Add Category
        </button>
      </form>

      {loading ? <p>Loading...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2D2D3F', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #1A1B26' }}>
                <td style={{ padding: '12px' }}>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.active ? 'Active' : 'Inactive'}</td>
                <td>
                  <button 
                    onClick={() => deleteCategory(c.id)}
                    style={{ padding: '6px 12px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Delete
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
