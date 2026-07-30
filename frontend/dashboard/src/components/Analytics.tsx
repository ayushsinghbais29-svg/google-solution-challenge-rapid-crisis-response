import React, { useState } from 'react';
import Modal from './Modal';

interface DataPoint {
  label: string;
  value: number;
}

interface Props {
  onNotify: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const INCIDENT_TREND: DataPoint[] = [
  { label: 'Mon', value: 3 },
  { label: 'Tue', value: 7 },
  { label: 'Wed', value: 5 },
  { label: 'Thu', value: 12 },
  { label: 'Fri', value: 8 },
  { label: 'Sat', value: 4 },
  { label: 'Sun', value: 6 },
];

const RESPONSE_TIMES: DataPoint[] = [
  { label: 'Mon', value: 4 },
  { label: 'Tue', value: 3 },
  { label: 'Wed', value: 5 },
  { label: 'Thu', value: 2 },
  { label: 'Fri', value: 3 },
  { label: 'Sat', value: 4 },
  { label: 'Sun', value: 3 },
];

const AI_CONFIDENCE_TREND: DataPoint[] = [
  { label: 'Mon', value: 88 },
  { label: 'Tue', value: 91 },
  { label: 'Wed', value: 89 },
  { label: 'Thu', value: 94 },
  { label: 'Fri', value: 93 },
  { label: 'Sat', value: 96 },
  { label: 'Sun', value: 94 },
];

const SERVICE_HEALTH: { service: string; uptime: number }[] = [
  { service: 'API Server', uptime: 99.8 },
  { service: 'Gemini Service', uptime: 97.5 },
  { service: 'Vertex AI', uptime: 98.2 },
  { service: 'Vision Service', uptime: 96.9 },
  { service: 'WebSocket', uptime: 99.1 },
];

const BarChart: React.FC<{ data: DataPoint[]; maxValue?: number; color?: string }> = ({
  data,
  maxValue,
  color = 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
}) => {
  const max = maxValue ?? Math.max(...data.map((d) => d.value));
  return (
    <div className="bar-chart">
      {data.map((d) => (
        <div key={d.label} className="bar-wrapper">
          <span className="bar-value">{d.value}</span>
          <div
            className="bar"
            style={{
              height: `${(d.value / max) * 100}%`,
              background: color,
            }}
          />
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const Analytics: React.FC<Props> = ({ onNotify }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    onNotify('📊 Loading analytics data…', 'info');
    await new Promise((res) => setTimeout(res, 800));
    setLoading(false);
    setIsOpen(true);
  };

  const totalIncidents = INCIDENT_TREND.reduce((s, d) => s + d.value, 0);
  const avgResponseTime = (RESPONSE_TIMES.reduce((s, d) => s + d.value, 0) / RESPONSE_TIMES.length).toFixed(1);
  const avgAIConfidence = Math.round(AI_CONFIDENCE_TREND.reduce((s, d) => s + d.value, 0) / AI_CONFIDENCE_TREND.length);

  return (
    <div className="card">
      <h2 className="card-title">📊 Analytics Overview</h2>

      <div className="metric">
        <span className="metric-label">Total Incidents (7d)</span>
        <span className="metric-value">{totalIncidents}</span>
      </div>
      <div className="metric">
        <span className="metric-label">Avg Response Time</span>
        <span className="metric-value">{avgResponseTime} min</span>
      </div>
      <div className="metric">
        <span className="metric-label">Avg AI Confidence</span>
        <span className="metric-value">{avgAIConfidence}%</span>
      </div>
      <div className="metric">
        <span className="metric-label">System Uptime</span>
        <span className="metric-value" style={{ color: '#27ae60' }}>98.7%</span>
      </div>

      <button className="button" onClick={handleOpen} disabled={loading}>
        {loading ? <><span className="spinner" /> Loading…</> : '📈 View Analytics'}
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="📊 Real-Time Analytics Dashboard" size="wide">
        <div>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total Incidents', value: totalIncidents, icon: '🚨', color: '#e74c3c' },
              { label: 'Avg Response', value: `${avgResponseTime}m`, icon: '⏱️', color: '#3498db' },
              { label: 'AI Confidence', value: `${avgAIConfidence}%`, icon: '🤖', color: '#27ae60' },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: '#f8f9fa', borderRadius: 10, padding: '14px',
                textAlign: 'center', borderTop: `3px solid ${stat.color}`
              }}>
                <div style={{ fontSize: '1.6rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Incident Trend Chart */}
          <div className="chart-container">
            <div className="chart-title">📅 Incident Trend (Last 7 Days)</div>
            <BarChart data={INCIDENT_TREND} />
          </div>

          {/* Response Time Chart */}
          <div className="chart-container">
            <div className="chart-title">⏱️ Response Time (minutes)</div>
            <BarChart
              data={RESPONSE_TIMES}
              maxValue={8}
              color="linear-gradient(180deg, #3498db 0%, #2980b9 100%)"
            />
          </div>

          {/* AI Confidence Chart */}
          <div className="chart-container">
            <div className="chart-title">🤖 AI Confidence Score (%)</div>
            <BarChart
              data={AI_CONFIDENCE_TREND}
              maxValue={100}
              color="linear-gradient(180deg, #27ae60 0%, #229954 100%)"
            />
          </div>

          {/* Service Health */}
          <div className="chart-container">
            <div className="chart-title">🖥️ Service Uptime (Last 30 Days)</div>
            {SERVICE_HEALTH.map((s) => (
              <div key={s.service} className="confidence-bar">
                <span className="confidence-label">{s.service}</span>
                <div className="confidence-track">
                  <div
                    className="confidence-fill"
                    style={{
                      width: `${s.uptime}%`,
                      background: s.uptime >= 99 ? '#27ae60' : s.uptime >= 97 ? '#f39c12' : '#e74c3c',
                    }}
                  />
                </div>
                <span className="confidence-pct">{s.uptime}%</span>
              </div>
            ))}
          </div>

          <button className="button" style={{ marginTop: 8 }} onClick={() => setIsOpen(false)}>
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Analytics;
