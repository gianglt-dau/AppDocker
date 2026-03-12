import { useState, useEffect } from 'react';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    setLoading(true);
    fetch('/api-python/dashboard')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) return <p>Đang tải...</p>;
  if (!data) return <p>Không có dữ liệu</p>;

  const cardStyle = {
    background: '#f5f5f5', borderRadius: '8px', padding: '20px',
    textAlign: 'center', minWidth: '120px'
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={fetchDashboard} style={{ padding: '8px 16px', cursor: 'pointer' }}>🔄 Refresh</button>
      </div>

      <h2>📊 Tổng quan hệ thống</h2>
      <p style={{ color: '#888', fontSize: '13px' }}>
        Dữ liệu thống kê được cung cấp bởi <strong>Python API</strong> (FastAPI)
      </p>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1565C0' }}>{data.total_users}</div>
          <div>👥 Users</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2E7D32' }}>{data.total_tasks}</div>
          <div>📝 Tasks</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F57C00' }}>{data.tasks_by_status.pending}</div>
          <div>⏳ Pending</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1976D2' }}>{data.tasks_by_status.in_progress}</div>
          <div>🔄 In Progress</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#388E3C' }}>{data.tasks_by_status.done}</div>
          <div>✅ Done</div>
        </div>
      </div>

      <h3>🏆 Top Users (nhiều task nhất)</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#e3f2fd' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>#</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Tên</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>Số tasks</th>
          </tr>
        </thead>
        <tbody>
          {data.top_users.map((u, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{i + 1}</td>
              <td style={{ padding: '8px' }}>{u.name}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{u.task_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
