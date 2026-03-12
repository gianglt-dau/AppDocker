import { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');

  const fetchUsers = () => fetch('/api-python/users').then(r => r.json()).then(setUsers);

  useEffect(() => { fetchUsers(); }, []);

  const addUser = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    await fetch('/api-python/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, email: newEmail, role: newRole })
    });
    setNewName('');
    setNewEmail('');
    setNewRole('member');
    fetchUsers();
  };

  const deleteUser = async (id) => {
    await fetch(`/api-python/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  const startEdit = (user) => {
    setEditId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
  };

  const saveEdit = async () => {
    await fetch(`/api-python/users/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, email: editEmail, role: editRole })
    });
    setEditId(null);
    fetchUsers();
  };

  const roleBadge = (role) => {
    const colors = { admin: '#E91E63', manager: '#9C27B0', member: '#607D8B' };
    return (
      <span style={{ background: colors[role] || '#999', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
        {role}
      </span>
    );
  };

  return (
    <div>
      <h2>👥 Quản lý Users <span style={{ fontSize: '13px', color: '#888', fontWeight: 'normal' }}>(Python API)</span></h2>

      {/* Form thêm user */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Tên..."
          style={{ padding: '8px', minWidth: '150px' }}
        />
        <input
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          placeholder="Email..."
          style={{ flex: 1, padding: '8px', minWidth: '200px' }}
        />
        <select value={newRole} onChange={e => setNewRole(e.target.value)} style={{ padding: '8px' }}>
          <option value="member">Member</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={addUser} style={{ padding: '8px 16px', background: '#9C27B0', color: '#fff', border: 'none', cursor: 'pointer' }}>
          ➕ Thêm
        </button>
      </div>

      {/* Bảng users */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3e5f5' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Role</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{u.id}</td>
              <td style={{ padding: '8px' }}>
                {editId === u.id
                  ? <input value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '4px' }} />
                  : u.name
                }
              </td>
              <td style={{ padding: '8px' }}>
                {editId === u.id
                  ? <input value={editEmail} onChange={e => setEditEmail(e.target.value)} style={{ width: '100%', padding: '4px' }} />
                  : u.email
                }
              </td>
              <td style={{ padding: '8px', textAlign: 'center' }}>
                {editId === u.id
                  ? <select value={editRole} onChange={e => setEditRole(e.target.value)} style={{ padding: '4px' }}>
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  : roleBadge(u.role)
                }
              </td>
              <td style={{ padding: '8px', textAlign: 'center' }}>
                {editId === u.id ? (
                  <>
                    <button onClick={saveEdit} style={{ marginRight: '4px', cursor: 'pointer' }}>💾</button>
                    <button onClick={() => setEditId(null)} style={{ cursor: 'pointer' }}>❌</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(u)} style={{ marginRight: '4px', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => deleteUser(u.id)} style={{ cursor: 'pointer' }}>🗑️</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>Chưa có user nào</p>}
    </div>
  );
}

export default UserList;
