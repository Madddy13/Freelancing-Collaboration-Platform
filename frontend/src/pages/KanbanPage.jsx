import React, { useEffect, useState } from 'react';
import API from '../api/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const COLUMNS = [
  { key:'TODO',        label:'To Do',       color:'#6B7280', accent:'rgba(107,114,128,0.15)' },
  { key:'IN_PROGRESS', label:'In Progress',  color:'#60A5FA', accent:'rgba(96,165,250,0.12)'  },
  { key:'TESTING',     label:'Testing',      color:'#FBBF24', accent:'rgba(251,191,36,0.12)'  },
  { key:'COMPLETED',   label:'Completed',    color:'#34D399', accent:'rgba(52,211,153,0.12)'  },
];

export default function KanbanPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [activeProjectId, setActiveProjectId] = useState(projectId || null);
  const [myProjects, setMyProjects]           = useState([]);
  const [tasks, setTasks]                     = useState([]);
  const [teamMembers, setTeamMembers]         = useState([]);
  const [title, setTitle]                     = useState('');
  const [description, setDesc]                = useState('');
  const [assignedToUserId, setAssignedToUserId] = useState('');
  const [loading, setLoading]                 = useState(true);
  const [adding, setAdding]                   = useState(false);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const isClient = user.role === 'ROLE_CLIENT';

  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        const endpoint = isClient ? `/projects/my-projects?clientId=${user.userId}` : '/projects';
        const res = await API.get(endpoint);
        const list = Array.isArray(res.data) ? res.data : [];
        setMyProjects(list);

        if (!projectId && list.length > 0) {
          setActiveProjectId(String(list[0].id));
          navigate(`/kanban/${list[0].id}`, { replace: true });
        } else if (projectId) {
          setActiveProjectId(String(projectId));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserProjects();
  }, [projectId, isClient, user.userId, navigate]);

  useEffect(() => {
    if (!activeProjectId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    API.get(`/tasks/project/${activeProjectId}`)
      .then(r => setTasks(Array.isArray(r.data) ? r.data : []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));

    API.get(`/projects/${activeProjectId}/team`)
      .then(res => API.get(`/projects/teams/${res.data.id}/members`))
      .then(res => setTeamMembers(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.warn("No team found for project", err);
        setTeamMembers([]);
      });
  }, [activeProjectId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!activeProjectId) return;
    setAdding(true);
    try {
      await API.post('/tasks', { 
        projectId: parseInt(activeProjectId), 
        title, 
        description, 
        status:'TODO',
        assignedToUserId: assignedToUserId ? parseInt(assignedToUserId) : null
      });
      setTitle(''); setDesc(''); setAssignedToUserId('');
      const r = await API.get(`/tasks/project/${activeProjectId}`);
      setTasks(Array.isArray(r.data) ? r.data : []);
    } catch { /* swallow */ }
    finally { setAdding(false); }
  };

  const moveTask = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}/status?status=${newStatus}`);
      const r = await API.get(`/tasks/project/${activeProjectId}`);
      setTasks(Array.isArray(r.data) ? r.data : []);
    } catch { /* swallow */ }
  };

  const assignTask = async (taskId, userId) => {
    try {
      const url = userId ? `/tasks/${taskId}/assign?assignedToUserId=${userId}` : `/tasks/${taskId}/assign`;
      await API.put(url, {});
      const r = await API.get(`/tasks/project/${activeProjectId}`);
      setTasks(Array.isArray(r.data) ? r.data : []);
    } catch (err) {
      console.error(err);
      alert("Error assigning task: " + (err.response?.data?.message || err.message));
    }
  };

  const getAssigneeName = (uid) => {
    if (!uid) return "Unassigned";
    const m = teamMembers.find(x => x.userId === uid);
    return m ? m.userName : "Unknown";
  };

  const colKeys = COLUMNS.map(c => c.key);

  if (!loading && !activeProjectId && myProjects.length === 0) {
    return (
      <Card padding="60px" style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📌</div>
        <h3 style={{ color: '#F9FAFB', margin: '0 0 8px' }}>No Task Boards Available</h3>
        <p style={{ color: '#6B7280', margin: 0 }}>You need an active project to view and manage task boards.</p>
      </Card>
    );
  }

  return (
    <div style={{ fontFamily:'Inter, sans-serif', width: '100%' }}>
      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        .task-card{animation:slideUp 0.25s ease both;transition:all 0.2s ease !important;}
        .task-card:hover{transform:translateY(-2px) !important;border-color:rgba(124,58,237,0.4) !important;box-shadow:0 6px 20px rgba(0,0,0,0.4) !important;}
        .move-btn:hover{background:rgba(124,58,237,0.2) !important;color:#A855F7 !important;}
        .move-btn{transition:all 0.15s ease !important;}
        .skeleton{background:linear-gradient(90deg,#13141C 25%,#1A1B26 50%,#13141C 75%);background-size:600px 100%;animation:shimmer 1.5s infinite;border-radius:10px;}
        .add-inp:focus{border-color:#7C3AED !important;box-shadow:0 0 0 3px rgba(124,58,237,0.15) !important;}
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:'24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }} className="page-fade">
        <div>
          <h1 style={{ fontSize:'24px', fontWeight:800, color:'#F9FAFB', margin:'0 0 4px' }}>Task Board</h1>
          <p style={{ color:'#6B7280', fontSize:'14px', margin:0 }}>Project #{activeProjectId} · {tasks.length} tasks total</p>
        </div>

        {myProjects.length > 1 && (
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ fontSize:'12px', color:'#6B7280', fontWeight:600 }}>Select Project:</span>
            <select
              value={activeProjectId || ''}
              onChange={e => {
                const newId = e.target.value;
                setActiveProjectId(newId);
                navigate(`/kanban/${newId}`);
              }}
              style={{
                background:'#13141C', color:'#F9FAFB', border:'1px solid #2D2D3F',
                borderRadius:'8px', padding:'6px 12px', fontSize:'13px', fontFamily:'Inter, sans-serif', outline:'none'
              }}
            >
              {myProjects.map(p => (
                <option key={p.id} value={p.id}>Project #{p.id}: {p.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Add Task Form */}
      <Card padding="20px" style={{ marginBottom:'24px' }} className="page-fade-2">
        <p style={{ fontSize:'12px', fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.8px', margin:'0 0 14px' }}>+ Add New Task</p>
        <form onSubmit={handleCreate} style={{ display:'flex', gap:'10px', alignItems:'flex-start', flexWrap:'wrap' }}>
          <input
            className="add-inp"
            type="text"
            placeholder="Task title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={s.addInput}
          />
          <input
            className="add-inp"
            type="text"
            placeholder="Description..."
            value={description}
            onChange={e => setDesc(e.target.value)}
            required
            style={{ ...s.addInput, flex:2 }}
          />
          <select
            value={assignedToUserId}
            onChange={e => setAssignedToUserId(e.target.value)}
            style={{ ...s.addInput, flex: 1, minWidth: '120px' }}
          >
            <option value="">Unassigned</option>
            {teamMembers.map(m => (
              <option key={m.id} value={m.userId}>{m.userName}</option>
            ))}
          </select>
          <Button type="submit" variant="primary" size="sm" disabled={adding}>
            {adding ? '⏳' : '✚ Add Task'}
          </Button>
        </form>
      </Card>

      {/* Kanban Board */}
      <div style={s.board} className="page-fade-3">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} style={s.column}>
              {/* Column header */}
              <div style={s.colHeader}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ width:'10px', height:'10px', borderRadius:'50%', background: col.color, display:'inline-block', boxShadow:`0 0 8px ${col.color}` }} />
                  <span style={{ fontWeight:700, fontSize:'13px', color:'#F9FAFB' }}>{col.label}</span>
                </div>
                <span style={{ background: col.accent, color: col.color, padding:'2px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:700, border:`1px solid ${col.color}30` }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div style={s.taskList}>
                {loading ? (
                  [1,2].map(i => <div key={i} className="skeleton" style={{ height:'90px', marginBottom:'10px' }} />)
                ) : colTasks.length === 0 ? (
                  <div style={s.emptyCol}>
                    <div style={{ fontSize:'24px', opacity:0.3, marginBottom:'6px' }}>📭</div>
                    <p style={{ color:'#6B7280', fontSize:'12px', margin:0 }}>No tasks here</p>
                  </div>
                ) : (
                  colTasks.map((task, idx) => (
                    <div
                      key={task.id}
                      className="task-card"
                      style={{ ...s.taskCard, animationDelay:`${idx*0.05}s`, borderLeft:`3px solid ${col.color}` }}
                    >
                      <h4 style={{ fontSize:'14px', fontWeight:700, color:'#F9FAFB', margin:'0 0 4px' }}>{task.title}</h4>
                      <p style={{ fontSize:'12px', color:'#6B7280', margin:'0 0 12px', lineHeight:1.5 }}>{task.description}</p>

                      <div style={{ display:'flex', gap:'6px' }}>
                        {col.key !== 'TODO' && (
                          <button
                            className="move-btn"
                            onClick={() => moveTask(task.id, colKeys[colKeys.indexOf(col.key)-1])}
                            style={s.moveBtn}
                          >← Back</button>
                        )}
                        {col.key !== 'COMPLETED' && (
                          <button
                            className="move-btn"
                            onClick={() => moveTask(task.id, colKeys[colKeys.indexOf(col.key)+1])}
                            style={{ ...s.moveBtn, background:'rgba(124,58,237,0.1)', color:'#A855F7', borderColor:'rgba(124,58,237,0.2)' }}
                          >Next →</button>
                        )}
                      </div>

                      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #2D2D3F', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#2D2D3F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#F9FAFB', fontWeight: 700 }}>
                             {getAssigneeName(task.assignedToUserId).charAt(0).toUpperCase()}
                           </div>
                           <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{getAssigneeName(task.assignedToUserId)}</span>
                         </div>
                         
                         {isClient && (
                           <select 
                             value={task.assignedToUserId || ''} 
                             onChange={(e) => assignTask(task.id, e.target.value)}
                             style={{ background: 'transparent', color: '#A855F7', border: 'none', fontSize: '11px', outline: 'none', cursor: 'pointer', maxWidth: '80px', fontWeight: 600 }}
                           >
                             <option value="">Assign...</option>
                             {teamMembers.map(m => (
                               <option key={m.id} value={m.userId}>{m.userName}</option>
                             ))}
                           </select>
                         )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  addInput: {
    flex:1, minWidth:'180px', padding:'9px 14px',
    background:'#0D0E15', border:'1.5px solid #2D2D3F',
    borderRadius:'10px', color:'#F9FAFB', fontSize:'14px',
    fontFamily:'Inter, sans-serif', outline:'none', transition:'all 0.2s',
  },
  board: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', alignItems:'start' },
  column: { display:'flex', flexDirection:'column', gap:'0' },
  colHeader: {
    display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'12px 16px', background:'#13141C',
    borderRadius:'12px 12px 0 0', borderBottom:'1px solid #2D2D3F',
    border:'1px solid #2D2D3F',
  },
  taskList: {
    background:'#0D0E15', border:'1px solid #2D2D3F', borderTop:'none',
    borderRadius:'0 0 12px 12px', padding:'12px', minHeight:'300px',
    display:'flex', flexDirection:'column', gap:'10px',
  },
  taskCard: {
    background:'#13141C', border:'1px solid #2D2D3F',
    borderRadius:'10px', padding:'14px',
    cursor:'default',
  },
  emptyCol: {
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    height:'120px', borderRadius:'10px',
    border:'1px dashed #2D2D3F',
  },
  moveBtn: {
    padding:'5px 12px', borderRadius:'7px', border:'1px solid #2D2D3F',
    background:'#1A1B26', color:'#6B7280', fontSize:'12px',
    fontWeight:600, cursor:'pointer', fontFamily:'Inter, sans-serif',
  },
};