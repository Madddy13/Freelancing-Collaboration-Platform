// src/pages/ChatPage.jsx
// Isolated Per-Project Chat UI with Dual Endpoint Sync (WebSocket + 3s Auto-Poll) & User Security Parameters

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import API from '../api/axiosInstance';
import Card from '../components/common/Card';

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getDateLabel(messages, index) {
  if (index === 0) return formatDate(messages[0].sentAt || messages[0].timestamp);
  const prev = new Date(messages[index - 1].sentAt || messages[index - 1].timestamp);
  const curr = new Date(messages[index].sentAt || messages[index].timestamp);
  if (prev.toDateString() !== curr.toDateString()) return formatDate(messages[index].sentAt || messages[index].timestamp);
  return null;
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
}

export default function ChatPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [myProjects, setMyProjects]               = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || null);
  const [currentProject, setCurrentProject]       = useState(null);
  const [teamMembers, setTeamMembers]             = useState([]);
  const [messages, setMessages]                   = useState([]);
  const [newMessage, setNewMessage]               = useState('');
  const [connected, setConnected]                 = useState(false);
  const [authorized, setAuthorized]               = useState(null); // true, false, or null (loading)
  const [loading, setLoading]                     = useState(true);
  const [uploading, setUploading]                 = useState(false);
  const [sending, setSending]                     = useState(false);
  const [dragOver, setDragOver]                   = useState(false);

  const stompClient = useRef(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const isClient = user.role === 'ROLE_CLIENT';
  const isFreelancer = user.role === 'ROLE_FREELANCER';

  const rawId = user.userId || user.id;
  const userId = rawId ? String(rawId) : null;

  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user.name || user.email?.split('@')[0] || 'You';

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Helper to load chat history directly from MySQL database
  const loadChatHistory = useCallback(async (pId) => {
    if (!pId || !userId) return;
    try {
      const chatRes = await API.get(`/chat/history/${pId}?userId=${userId}`);
      if (Array.isArray(chatRes.data)) {
        setMessages(chatRes.data);
      }
    } catch {
      try {
        const fallbackRes = await API.get(`/chat/project/${pId}?userId=${userId}`);
        if (Array.isArray(fallbackRes.data)) {
          setMessages(fallbackRes.data);
        }
      } catch { /* ignore */ }
    }
  }, [userId]);

  // 1. Initial load: Fetch user's authorized projects if no projectId param or to build channel list
  useEffect(() => {
    if (!userId) return;

    const fetchUserProjects = async () => {
      try {
        let list = [];
        if (isClient) {
          try {
            const res = await API.get(`/projects/my-projects?clientId=${userId}`);
            list = Array.isArray(res.data) ? res.data : [];
          } catch { /* fallback */ }

          if (list.length === 0) {
            try {
              const res = await API.get(`/projects/client/${userId}`);
              list = Array.isArray(res.data) ? res.data : [];
            } catch { /* fallback */ }
          }

          if (list.length === 0) {
            try {
              const res = await API.get('/projects');
              if (Array.isArray(res.data)) {
                list = res.data.filter(p => String(p.clientId) === userId);
              }
            } catch { /* ignore */ }
          }
        } else if (isFreelancer) {
          try {
            const res = await API.get(`/projects/freelancer/${userId}`);
            list = Array.isArray(res.data) ? res.data : [];
          } catch { /* ignore */ }
        }

        setMyProjects(list);

        if (!projectId && list.length > 0) {
          setSelectedProjectId(String(list[0].id));
          navigate(`/chat/${list[0].id}`, { replace: true });
        } else if (projectId) {
          setSelectedProjectId(String(projectId));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserProjects();
  }, [projectId, isClient, isFreelancer, userId, navigate]);

  // 2. Load Project Details + Verify Authorization for selectedProjectId + Load Messages
  useEffect(() => {
    if (!selectedProjectId || !userId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setAuthorized(null);

    const checkAuthAndLoad = async () => {
      try {
        // Fetch project metadata
        const projRes = await API.get(`/projects/${selectedProjectId}`);
        const proj = projRes.data;

        // Fetch applications for this project
        let apps = [];
        try {
          const appsRes = await API.get(`/projects/${selectedProjectId}/applications`);
          apps = Array.isArray(appsRes.data) ? appsRes.data : [];
        } catch { /* ignore */ }

        // Fetch team members for this project
        let members = [];
        try {
          const teamRes = await API.get(`/projects/${selectedProjectId}/team`);
          if (teamRes.data?.id) {
            const memRes = await API.get(`/projects/teams/${teamRes.data.id}/members`);
            members = Array.isArray(memRes.data) ? memRes.data : [];
          }
        } catch { /* team may not be formed yet */ }

        if (!isMounted) return;

        setCurrentProject(proj);
        setTeamMembers(members);

        // Security check: Is user authorized for this isolated chat channel?
        // Client owner OR Hired Freelancer (accepted application / team member)
        const isOwner = String(proj.clientId) === userId;
        const isAcceptedApp = apps.some(a => String(a.freelancerId) === userId && a.status === 'ACCEPTED');
        const isTeamMember  = members.some(m => String(m.userId) === userId);

        if (isOwner || isAcceptedApp || isTeamMember) {
          setAuthorized(true);
          // Load chat history from MySQL
          await loadChatHistory(selectedProjectId);
        } else {
          setAuthorized(false);
        }
      } catch (err) {
        if (isMounted) setAuthorized(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuthAndLoad();

    return () => { isMounted = false; };
  }, [selectedProjectId, userId, loadChatHistory]);

  // 3. Periodic Auto-Poll (Every 3 seconds) for Guaranteed Message Sync across Client & Freelancer
  useEffect(() => {
    if (!authorized || !selectedProjectId) return;

    const interval = setInterval(() => {
      loadChatHistory(selectedProjectId);
    }, 3000);

    return () => clearInterval(interval);
  }, [authorized, selectedProjectId, loadChatHistory]);

  // 4. WebSocket Subscription for Real-Time Updates
  useEffect(() => {
    if (!authorized || !selectedProjectId) return;

    const wsUrl = `${process.env.REACT_APP_API_BASE || 'http://localhost:8080'}/ws`;
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/chat/${selectedProjectId}`, (msg) => {
          try {
            const parsed = JSON.parse(msg.body);
            setMessages(prev => {
              if (prev.some(m => m.id && m.id === parsed.id)) return prev;
              return [...prev, parsed];
            });
          } catch { /* ignore */ }
        });
      },
      onDisconnect: () => setConnected(false),
      reconnectDelay: 5000,
    });

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, [authorized, selectedProjectId]);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const isCompleted = currentProject?.status === 'COMPLETED' || currentProject?.status === 'CLOSED';

  // Download File Helper
  const handleDownload = async (e, fileUrl, fileName) => {
    e.preventDefault();
    // Encode the URI to handle spaces in filenames correctly
    const encodedUrl = encodeURI(`${process.env.REACT_APP_API_BASE || 'http://localhost:8080'}${fileUrl}`);
    try {
      const res = await fetch(encodedUrl);
      if (!res.ok) throw new Error('Network response was not ok');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed via fetch, falling back to window.open', err);
      window.open(encodedUrl, '_blank');
    }
  };

  // Send Text Message with Persistence in MySQL & Instant History Refresh
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedProjectId || isCompleted || sending) return;

    const msgText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    const msgPayload = {
      projectId: parseInt(selectedProjectId),
      senderId: parseInt(userId),
      senderName: displayName,
      message: msgText,
      content: msgText,
      messageType: 'TEXT',
      sentAt: new Date().toISOString(),
    };

    try {
      await API.post(`/chat?userId=${userId}`, msgPayload);
      // Immediately reload updated chat history from MySQL
      await loadChatHistory(selectedProjectId);
    } catch {
      // Fallback: Publish via STOMP if REST endpoint fails
      if (stompClient.current?.connected) {
        stompClient.current.publish({
          destination: `/app/chat/${selectedProjectId}`,
          body: JSON.stringify(msgPayload),
        });
      }
    } finally {
      setSending(false);
    }
  };

  // Upload File Attachment
  const handleFileUpload = async (file) => {
    if (!file || !selectedProjectId || isCompleted) return;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) { alert('File size limit is 10MB.'); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', selectedProjectId);

      const res = await API.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const isImage = file.type.startsWith('image/');
      const fileContent = isImage ? '📷 Image' : `📎 ${file.name}`;
      const msgPayload = {
        projectId: parseInt(selectedProjectId),
        senderId: parseInt(userId),
        senderName: displayName,
        message: fileContent,
        content: fileContent,
        messageType: isImage ? 'IMAGE' : 'FILE',
        fileUrl: res.data.fileUrl,
        fileName: file.name,
        fileSize: file.size,
        sentAt: new Date().toISOString(),
      };

      await API.post(`/chat?userId=${userId}`, msgPayload);
      await loadChatHistory(selectedProjectId);
    } catch {
      alert('File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const isOwnMessage = (msg) =>
    msg.senderId?.toString() === userId?.toString() ||
    msg.senderName === displayName;

  // Render Access Denied state if unauthorized
  if (authorized === false) {
    return (
      <div style={{ padding: '40px 0', width: '100%', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
        <Card padding="60px" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ color: '#F9FAFB', margin: '0 0 8px', fontSize: '22px' }}>Chat Channel Restricted</h2>
          <p style={{ color: '#9CA3AF', margin: '0 0 24px', lineHeight: 1.6, fontSize: '14px' }}>
            This chat channel is isolated for Project #{selectedProjectId}. Only the Client owner and hired team members can access messages.
          </p>
          <button
            onClick={() => navigate(isClient ? '/my-projects' : '/projects')}
            style={{
              padding: '10px 22px', background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
              color: '#fff', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer',
            }}
          >
            {isClient ? '← Return to My Projects' : '← Return to Projects'}
          </button>
        </Card>
      </div>
    );
  }

  // Render Empty State if no projects exist
  if (!loading && !selectedProjectId && myProjects.length === 0) {
    return (
      <div style={{ padding: '40px 0', width: '100%', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
        <Card padding="60px" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>💬</div>
          <h2 style={{ color: '#F9FAFB', margin: '0 0 8px', fontSize: '22px' }}>No Active Project Chats</h2>
          <p style={{ color: '#9CA3AF', margin: '0 0 24px', lineHeight: 1.6, fontSize: '14px' }}>
            {isClient ? 'Post a project to unlock dedicated per-project team chat rooms.' : 'Join a project team to access team chat channels.'}
          </p>
          {isClient ? (
            <Link to="/create-project" style={{
              padding: '11px 22px', background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
              color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, display: 'inline-block',
            }}>
              ✚ Post a Project
            </Link>
          ) : (
            <Link to="/projects" style={{
              padding: '11px 22px', background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
              color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, display: 'inline-block',
            }}>
              🔍 Find Projects
            </Link>
          )}
        </Card>
      </div>
    );
  }

  const AVATAR_COLORS = ['#7C3AED','#3B82F6','#10B981','#F59E0B','#EC4899','#6366F1'];

  return (
    <div style={{
      height: 'calc(100vh - 120px)',
      display: 'flex', flexDirection: 'column',
      background: '#090A0F',
      borderRadius: '16px', overflow: 'hidden',
      border: '1px solid #2D2D3F',
      fontFamily: 'Inter, sans-serif',
      width: '100%',
    }}>
      {/* ── Chat Header & Switcher ── */}
      <div style={{
        background: '#13141C', borderBottom: '1px solid #2D2D3F',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, gap: '16px', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: isCompleted ? '#2D2D3F' : 'linear-gradient(135deg, #7C3AED, #6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', boxShadow: isCompleted ? 'none' : '0 4px 12px rgba(124,58,237,0.4)',
          }}>💬</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#F9FAFB' }}>
                {currentProject ? currentProject.title : `Project #${selectedProjectId} Chat`}
              </h4>
              <span style={{
                fontSize: '11px',
                background: isCompleted ? 'rgba(239,68,68,0.15)' : 'rgba(124,58,237,0.2)',
                color: isCompleted ? '#F87171' : '#A855F7',
                padding: '2px 8px', borderRadius: '6px', fontWeight: 700
              }}>
                {isCompleted ? '🔒 COMPLETED' : `🔒 Channel #${selectedProjectId}`}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <div style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: isCompleted ? '#EF4444' : '#10B981',
              }} />
              <span style={{ fontSize: '12px', color: '#6B7280' }}>
                {isCompleted ? 'Project Completed — Chat Closed' : 'Encrypted Project Chat Channel'}
              </span>
            </div>
          </div>
        </div>

        {/* Project Channel Switcher Dropdown */}
        {myProjects.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>Switch Project:</span>
            <select
              value={selectedProjectId || ''}
              onChange={e => {
                const newId = e.target.value;
                setSelectedProjectId(newId);
                navigate(`/chat/${newId}`);
              }}
              style={{
                background: '#1A1B26', color: '#F9FAFB', border: '1px solid #2D2D3F',
                borderRadius: '8px', padding: '6px 12px', fontSize: '13px', fontFamily: 'Inter, sans-serif', outline: 'none',
              }}
            >
              {myProjects.map(p => (
                <option key={p.id} value={p.id}>
                  Project #{p.id}: {p.title} {p.status === 'COMPLETED' ? '(Completed)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.25)',
          padding: '10px 20px', color: '#F87171', fontSize: '13px', fontWeight: 600,
          textAlign: 'center', flexShrink: 0
        }}>
          🔒 Project Completed — This project is marked as COMPLETED. Chat channel is closed for new messages.
        </div>
      )}

      {/* ── Messages Area ── */}
      <div
        style={{ flex: 1, overflowY: 'auto', padding: '20px 20px', background: '#0D0E15', position: 'relative' }}
        onDragOver={e => { if (!isCompleted) { e.preventDefault(); setDragOver(true); } }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          if (!isCompleted) {
            e.preventDefault(); setDragOver(false);
            handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
      >
        {dragOver && !isCompleted && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(124,58,237,0.15)',
            border: '2px dashed #7C3AED', borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', color: '#A855F7', fontWeight: 700, zIndex: 10, backdropFilter: 'blur(4px)',
          }}>
            📎 Drop file to upload to Project #{selectedProjectId} Chat
          </div>
        )}

        {messages.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
            <p style={{ fontWeight: 700, fontSize: '16px', color: '#F9FAFB', margin: '0 0 4px' }}>Isolated Project Chat Active</p>
            <p style={{ fontSize: '13px', margin: 0 }}>Start the conversation with team members on Project #{selectedProjectId}.</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const own = isOwnMessage(msg);
          const dateLabel = getDateLabel(messages, i);
          const msgName = msg.senderName || (own ? displayName : 'Team Member');
          const msgText = msg.message || msg.content || '';

          return (
            <div key={msg.id || i}>
              {dateLabel && (
                <div style={{ textAlign: 'center', margin: '20px 0 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: '1px', background: '#2D2D3F' }} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', background: '#13141C', padding: '3px 12px', borderRadius: '20px', border: '1px solid #2D2D3F' }}>
                    {dateLabel}
                  </span>
                  <div style={{ flex: 1, height: '1px', background: '#2D2D3F' }} />
                </div>
              )}

              <div style={{
                display: 'flex',
                flexDirection: own ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: '10px',
                marginBottom: '12px',
              }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                  background: own ? 'linear-gradient(135deg, #7C3AED, #6366F1)' : AVATAR_COLORS[i % AVATAR_COLORS.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: '#fff',
                }}>
                  {getInitials(msgName)}
                </div>

                <div style={{ maxWidth: '68%', display: 'flex', flexDirection: 'column', alignItems: own ? 'flex-end' : 'flex-start' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: own ? '#A855F7' : '#34D399', marginBottom: '4px', paddingLeft: '4px', paddingRight: '4px' }}>
                    {msgName} {own ? '(You)' : ''}
                  </span>

                  <div style={{
                    padding: '12px 16px',
                    borderRadius: own ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: own ? 'linear-gradient(135deg, #7C3AED, #6366F1)' : '#13141C',
                    color: '#F9FAFB',
                    border: own ? 'none' : '1px solid #2D2D3F',
                    fontSize: '14px', lineHeight: '1.5',
                  }}>
                    {(!msg.messageType || msg.messageType === 'TEXT') && (
                      <span>{msgText}</span>
                    )}

                    {msg.messageType === 'IMAGE' && msg.fileUrl && (
                      <div>
                        <img
                          src={`${process.env.REACT_APP_API_BASE || 'http://localhost:8080'}${msg.fileUrl}`}
                          alt={msg.fileName || 'image'}
                          style={{ maxWidth: '280px', borderRadius: '10px', display: 'block', cursor: 'pointer' }}
                          onClick={() => window.open(`${process.env.REACT_APP_API_BASE || 'http://localhost:8080'}${msg.fileUrl}`, '_blank')}
                        />
                      </div>
                    )}

                    {msg.messageType === 'FILE' && msg.fileUrl && (
                      <a
                        href={`${process.env.REACT_APP_API_BASE || 'http://localhost:8080'}${msg.fileUrl}`}
                        onClick={(e) => handleDownload(e, msg.fileUrl, msg.fileName)}
                        download={msg.fileName}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#F9FAFB', cursor: 'pointer' }}
                      >
                        <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                          📄
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>{msg.fileName}</p>
                          <p style={{ margin: 0, fontSize: '11px', opacity: 0.75 }}>{formatBytes(msg.fileSize)} • Download</p>
                        </div>
                      </a>
                    )}
                  </div>

                  <span style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px', paddingLeft: '4px', paddingRight: '4px' }}>
                    {formatTime(msg.sentAt || msg.timestamp)} {own && '✓✓'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── Input Area ── */}
      {!isCompleted ? (
        <div style={{ background: '#13141C', borderTop: '1px solid #2D2D3F', padding: '14px 20px', flexShrink: 0 }}>
          {uploading && (
            <div style={{ fontSize: '12px', color: '#A855F7', marginBottom: '8px', fontWeight: 500 }}>
              ⏳ Uploading attachment...
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
                background: '#1A1B26', border: '1px solid #2D2D3F',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', cursor: 'pointer', color: '#9CA3AF',
              }}
              title="Attach File"
            >📎</button>

            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={e => handleFileUpload(e.target.files[0])}
            />

            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={`Type a message to Project #${selectedProjectId} team...`}
              style={{
                flex: 1, padding: '12px 16px',
                border: '1.5px solid #2D2D3F', borderRadius: '12px',
                fontSize: '14px', fontFamily: 'Inter, sans-serif',
                outline: 'none', background: '#0D0E15', color: '#F9FAFB',
              }}
            />

            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              style={{
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                background: newMessage.trim() && !sending
                  ? 'linear-gradient(135deg, #7C3AED, #6366F1)'
                  : '#1A1B26',
                border: 'none', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', cursor: newMessage.trim() && !sending ? 'pointer' : 'default',
              }}
            >
              ➤
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: '#13141C', borderTop: '1px solid #2D2D3F', padding: '16px 20px', textAlign: 'center', color: '#6B7280', fontSize: '13px', flexShrink: 0 }}>
          🔒 This chat channel is closed because the project is marked as <strong>COMPLETED</strong>.
        </div>
      )}
    </div>
  );
}