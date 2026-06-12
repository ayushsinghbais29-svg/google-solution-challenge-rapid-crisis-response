import React from 'react';
import SystemStatus from './SystemStatus';
import IncidentManager from './IncidentManager';
import AIAnalysis from './AIAnalysis';
import Resources from './Resources';

const QUICK_ACTIONS = [
  { label: '📊 View Analytics', color: '#2563eb' },
  { label: '🔔 Send Alert',     color: '#ef4444' },
  { label: '📝 Generate Report',color: '#059669' },
  { label: '🗂️ View Logs',      color: '#7c3aed' },
];

function QuickActions({ dark, onAction }) {
  const card = { backgroundColor: dark ? '#1e293b' : '#ffffff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', color: dark ? '#e2e8f0' : '#1e293b' };
  return (
    <div style={card}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>⚡ Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {QUICK_ACTIONS.map(({ label, color }) => (
          <button
            key={label}
            onClick={() => onAction && onAction(label)}
            style={{
              padding: '14px 10px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: color,
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              transition: 'opacity 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MicroservicesPanel({ dark }) {
  const MICROSERVICES = [
    { name: 'API',       port: 3000, color: '#2563eb' },
    { name: 'Gemini',   port: 3001, color: '#7c3aed' },
    { name: 'Vertex',   port: 3002, color: '#059669' },
    { name: 'Vision',   port: 3003, color: '#f59e0b' },
    { name: 'WS',       port: 8080, color: '#ef4444' },
  ];
  const card = { backgroundColor: dark ? '#1e293b' : '#ffffff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', color: dark ? '#e2e8f0' : '#1e293b' };
  return (
    <div style={card}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>🔌 Microservices</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {MICROSERVICES.map(({ name, port, color }) => (
          <div
            key={name}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              backgroundColor: color,
              color: '#fff',
              textAlign: 'center',
              flex: '1 1 80px',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 15 }}>{name}</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>:{port}</div>
            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 600 }}>✅</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ dark, onToggleDark, wsStatus }) {
  const bg = dark
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    : 'linear-gradient(135deg, #6a0dad 0%, #4c1d95 50%, #312e81 100%)';

  const handleAction = (label) => {
    alert(`${label} — feature coming soon!`);
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ maxWidth: 1280, margin: '0 auto 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: 0 }}>
              🚨 Crisis Response Dashboard
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', fontSize: 14 }}>
              AI-Powered Emergency Coordination for Hospitality
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span
              style={{
                padding: '5px 12px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                backgroundColor: wsStatus === 'connected' ? '#22c55e' : wsStatus === 'connecting' ? '#f59e0b' : '#ef4444',
                color: '#fff',
              }}
            >
              {wsStatus === 'connected' ? '🟢 WS Live' : wsStatus === 'connecting' ? '🟡 WS Connecting…' : '🔴 WS Offline'}
            </span>
            <button
              onClick={onToggleDark}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
                backdropFilter: 'blur(4px)',
              }}
            >
              {dark ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
        }}
      >
        <SystemStatus dark={dark} />
        <IncidentManager dark={dark} />
        <AIAnalysis dark={dark} />
        <Resources dark={dark} />
        <QuickActions dark={dark} onAction={handleAction} />
        <MicroservicesPanel dark={dark} />
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
        Rapid Crisis Response Platform · Google Solution Challenge 2026
      </div>
    </div>
  );
}

export default Dashboard;
