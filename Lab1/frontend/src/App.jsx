import { useState, useEffect } from 'react';

function App() {
  const [nodeTasks, setNodeTasks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api-node/tasks')
      .then(res => res.json())
      .then(data => setNodeTasks(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Manager</h1>
      <h2>Dữ liệu từ NodeJS API:</h2>
      <ul>
        {nodeTasks.map(t => <li key={t.id}>{t.title}</li>)}
      </ul>
    </div>
  );
}
export default App;
