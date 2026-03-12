import { useState, useEffect } from 'react';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const fetchTasks = () => fetch('/api-node/tasks').then(r => r.json()).then(setTasks);
  const fetchUsers = () => fetch('/api-python/users').then(r => r.json()).then(setUsers);

  useEffect(() => { fetchTasks(); fetchUsers(); }, []);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    await fetch('/api-node/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, assigned_to: newAssignee || null })
    });
    setNewTitle('');
    setNewAssignee('');
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`/api-node/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  const startEdit = (task) => {
    setEditId(task.id);
    setEditTitle(task.title);
    setEditStatus(task.status);
  };

  const saveEdit = async () => {
    await fetch(`/api-node/tasks/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle, status: editStatus })
    });
    setEditId(null);
    fetchTasks();
  };

  const getUserName = (id) => {
    const user = users.find(u => u.id === id);
    return user ? user.name : '—';
  };

  const statusBadge = (status) => {
    const colors = { pending: '#FF9800', in_progress: '#2196F3', done: '#4CAF50' };
    const labels = { pending: '⏳ Pending', in_progress: '🔄 In Progress', done: '✅ Done' };
    return (
      <span style={{ background: colors[status] || '#999', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div>
      <h2>📝 Quản lý Tasks <span style={{ fontSize: '13px', color: '#888', fontWeight: 'normal' }}>(NodeJS API)</span></h2>

      {/* Form thêm task */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Nhập tên task..."
          style={{ flex: 1, padding: '8px', minWidth: '200px' }}
          onKeyDown={e => e.key === 'Enter' && addTask()}
        />
        <select value={newAssignee} onChange={e => setNewAssignee(e.target.value)} style={{ padding: '8px' }}>
          <option value="">-- Gán cho --</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <button onClick={addTask} style={{ padding: '8px 16px', background: '#2196F3', color: '#fff', border: 'none', cursor: 'pointer' }}>
          ➕ Thêm
        </button>
      </div>

      {/* Bảng tasks */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#e8f5e9' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Title</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Status</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Assigned To</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{t.id}</td>
              <td style={{ padding: '8px' }}>
                {editId === t.id
                  ? <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ width: '100%', padding: '4px' }} />
                  : t.title
                }
              </td>
              <td style={{ padding: '8px', textAlign: 'center' }}>
                {editId === t.id
                  ? <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ padding: '4px' }}>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  : statusBadge(t.status)
                }
              </td>
              <td style={{ padding: '8px' }}>{getUserName(t.assigned_to)}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>
                {editId === t.id ? (
                  <>
                    <button onClick={saveEdit} style={{ marginRight: '4px', cursor: 'pointer' }}>💾</button>
                    <button onClick={() => setEditId(null)} style={{ cursor: 'pointer' }}>❌</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(t)} style={{ marginRight: '4px', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => deleteTask(t.id)} style={{ cursor: 'pointer' }}>🗑️</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tasks.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>Chưa có task nào</p>}
    </div>
  );
}

export default TaskList;
