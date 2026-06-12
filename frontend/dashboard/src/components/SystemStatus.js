import React, { useState, useEffect, useCallback } from 'react';
import { checkServiceHealth } from '../services/api';

const SERVICES = [
  { name: 'API Server',       url: 'http://localhost:3000/api/health', port: 3000 },
  { name: 'Gemini Service',   url: 'http://localhost:3001/health',     port: 3001 },
  { name: 'Vertex AI',        url: 'http://localhost:3002/health',     port: 3002 },
  { name: 'Vision Service',   url: 'http://localhost:3003/health',     port: 3003 },
  { name: 'WebSocket Server', url: 'http://localhost:8080/health',     port: 8080 },
];

const dot = (online) => ({
  display: 'inline-block',
  width: 10,
  height: 10,
  borderRadius: '50%',
  backgroundColor: online ? '#22c55e' : '#ef4444',
  marginRight: 8,
  flexShrink: 0,
});

const badge = (online) => ({
  padding: '3px 10px',
  borderRadius: 12,
  fontSize: 12,
  fontWeight: 700,
  backgroundColor: online ? '#dcfce7' : '#fee2e2',
  color: online ? '#166534' : '#991b1b',
});

function SystemStatus({ dark }) {
  const [statuses, setStatuses] = useState({});
  const [checking, setChecking] = useState(true);

  const checkAll = useCallback(async () => {
    const results = await Promise.all(
      SERVICES.map(async (svc) => {
        const r = await checkServiceHealth(svc.url);
        return [svc.name, { ...r, port: svc.port }];
      })
    );
    setStatuses(Object.fromEntries(results));
    setChecking(false);
  }, []);

  useEffect(() => {
    checkAll();
    const interval = setInterval(checkAll, 5000);
    return () => clearInterval(interval);
  }, [checkAll]);

  const onlineCount = Object.values(statuses).filter((s) => s.online).length;
  const card = {
    backgroundColor: dark ? '#1e293b' : '#ffffff',
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    color: dark ? '#e2e8f0' : '#1e293b',
  };

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🖥️ System Status</h2>
        <span style={{ fontSize: 13, color: dark ? '#94a3b8' : '#64748b' }}>
          {checking ? 'Checking…' : `${onlineCount}/${SERVICES.length} online`}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SERVICES.map((svc) => {
          const s = statuses[svc.name];
          const online = s?.online ?? false;
          return (
            <div
              key={svc.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 8,
                backgroundColor: dark ? '#0f172a' : '#f8fafc',
                border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={dot(online)} />
                <span style={{ fontWeight: 500, fontSize: 14 }}>{svc.name}</span>
                <span style={{ marginLeft: 8, fontSize: 12, color: dark ? '#64748b' : '#94a3b8' }}>
                  :{svc.port}
                </span>
              </div>
              <span style={badge(online)}>{online ? 'Online' : 'Offline'}</span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: dark ? '#64748b' : '#94a3b8', textAlign: 'right' }}>
        Auto-refreshes every 5 s
      </div>
    </div>
  );
}

export default SystemStatus;
