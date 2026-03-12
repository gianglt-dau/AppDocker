import { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import UserList from './components/UserList';
import Dashboard from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabStyle = (tab) => ({
    padding: '10px 24px',
    cursor: 'pointer',
    border: 'none',
    borderBottom: activeTab === tab ? '3px solid #2196F3' : '3px solid transparent',
    background: activeTab === tab ? '#e3f2fd' : 'transparent',
    fontWeight: activeTab === tab ? 'bold' : 'normal',
    fontSize: '15px',
  });

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '960px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#1565C0' }}>📋 Task Manager - Microservices</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>
        NodeJS API → Tasks &nbsp;|&nbsp; Python API → Users & Dashboard
      </p>

      <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
        <button style={tabStyle('dashboard')} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
        <button style={tabStyle('tasks')} onClick={() => setActiveTab('tasks')}>📝 Tasks (NodeJS)</button>
        <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>👥 Users (Python)</button>
      </div>

      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'tasks' && <TaskList />}
      {activeTab === 'users' && <UserList />}
    </div>
  );
}

export default App;
