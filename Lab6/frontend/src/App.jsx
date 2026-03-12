import { useState, useEffect } from 'react';

function App() {
  const [nodeTasks, setNodeTasks] = useState([]);
  const [pythonTasks, setPythonTasks] = useState([]);

  useEffect(() => {
    fetch('/api-node/tasks').then(res => res.json()).then(setNodeTasks);
    fetch('/api-python/tasks').then(res => res.json()).then(setPythonTasks);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Manager - Full Docker</h1>
      <h2>Từ NodeJS (Database):</h2>
      <ul>{nodeTasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>
      <h2>Từ Python (Database):</h2>
      <ul>{pythonTasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>
    </div>
  );
}
export default App;
