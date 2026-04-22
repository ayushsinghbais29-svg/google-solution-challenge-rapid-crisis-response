import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3000';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'checking';
  port: number;
}

const SERVICES: ServiceStatus[] = [
  { name: 'API Server', url: `${API_BASE}/health`, status: 'checking', port: 3000 },
  { name: 'Gemini Service', url: 'http://localhost:3001/health', status: 'checking', port: 3001 },
  { name: 'Vertex AI', url: 'http://localhost:3002/health', status: 'checking', port: 3002 },
  { name: 'Vision Service', url: 'http://localhost:3003/health', status: 'checking', port: 3003 },
  { name: 'WebSocket', url: 'http://localhost:8080/health', status: 'checking', port: 8080 },
];

const SystemStatus: React.FC = () => {
  const [statuses, setStatuses] = useState<ServiceStatus[]>(SERVICES);
  const [lastChecked, setLastChecked] = useState<string>('');

  const checkServices = useCallback(async () => {
    const updated = await Promise.all(
      SERVICES.map(async (service) => {
        try {
          const response = await fetch(service.url, {
            signal: AbortSignal.timeout(3000),
          });
          return { ...service, status: response.ok ? 'online' as const : 'offline' as const };
        } catch {
          return { ...service, status: 'offline' as const };
        }
      })
    );
    setStatuses(updated);
    setLastChecked(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 10000);
    return () => clearInterval(interval);
  }, [checkServices]);

  const onlineCount = statuses.filter((s) => s.status === 'online').length;

  return (
    <div className="card">
      <h2 className="card-title">🖥️ System Status</h2>
      {statuses.map((service) => (
        <div key={service.name} className="metric">
          <span className="metric-label">
            {service.name}
            <span style={{ color: '#aaa', fontSize: '0.78rem', marginLeft: 6 }}>:{service.port}</span>
          </span>
          <span className={`metric-value status-${service.status}`}>
            {service.status === 'checking' && '🟡 Checking…'}
            {service.status === 'online' && '🟢 Online'}
            {service.status === 'offline' && '🔴 Offline'}
          </span>
        </div>
      ))}
      <div style={{ marginTop: 12, fontSize: '0.8rem', color: '#aaa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{onlineCount}/{statuses.length} services online</span>
        {lastChecked && <span>Last checked: {lastChecked}</span>}
      </div>
      <button className="button button-secondary" style={{ background: 'none', border: '1px solid #667eea', color: '#667eea', marginTop: 10 }} onClick={checkServices}>
        🔄 Refresh Status
      </button>
    </div>
  );
};

export default SystemStatus;
