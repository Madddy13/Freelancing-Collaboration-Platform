// src/components/profile/AvatarUploader.jsx
// Drag-drop avatar uploader with live preview.

import React, { useState, useRef } from 'react';
import API from '../../api/axiosInstance';

export default function AvatarUploader({ userId, onUpload }) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('Image must be under 3MB.');
      return;
    }
    setError('');
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await API.post(`/users/avatar/${userId}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUpload(res.data.avatarUrl);
    } catch (e) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.07)', marginBottom: '24px',
    }}>
      <h5 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px' }}>Profile Photo</h5>
      <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px' }}>
        Upload a new avatar. JPG, PNG or WebP, max 3MB.
      </p>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault(); setDragging(false);
          const file = e.dataTransfer.files[0];
          handleFile(file);
        }}
        onClick={() => inputRef.current.click()}
        style={{
          border: `2px dashed ${dragging ? '#6366f1' : '#e2e8f0'}`,
          borderRadius: '12px',
          padding: '32px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? '#eef2ff' : '#f8fafc',
          transition: 'all 0.2s ease',
          position: 'relative',
        }}
      >
        {preview ? (
          <img src={preview} alt="Preview"
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '12px' }}
          />
        ) : (
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🖼️</div>
        )}
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
          {uploading ? 'Uploading...' : 'Drag & drop or click to select image'}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
      </div>

      {error && (
        <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>{error}</p>
      )}
    </div>
  );
}