import React, { useState, useEffect, useCallback } from 'react';
import { getIncidents, createIncident, updateIncident } from '../services/api';

const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
  PENDING_ANALYSIS: '#94a3b8',
};

const STATUS_COLORS = {
  ACTIVE: '#ef4444',
  INVESTIGATING: '#f97316',
  CONTAINED: '#3b82f6',
  RESOLVED: '#22c55e',
  REPORTED: '#a855f7',
};

const THREAT_TYPES = ['FIRE', 'FLOOD', 'MEDICAL', 'SECURITY', 'CHEMICAL', 'EARTHQUAKE', 'OTHER'];

function IncidentManager({ dark }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    venue_id: 'venue-001',
    threat_type: 'FIRE',
    location: { lat: 40.7128, lng: -74.006 },
    description: '',
  });
  const [updateStatus, setUpdateStatus] = useState({});

  const fetchIncidents = useCallback(async () => {
    try {
      const data = await getIncidents();
      setIncidents(data.incidents || []);
      setError(null);
    } catch (err) {
      setError('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newIncident = await createIncident(form);
      setIncidents((prev) => [newIncident, ...prev]);
      setShowForm(false);
      setForm({ venue_id: 'venue-001', threat_type: 'FIRE', location: { lat: 40.7128, lng: -74.006 }, description: '' });
    } catch (err) {
      alert('Failed to create incident: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdateStatus((prev) => ({ ...prev, [id]: true }));
    try {
      await updateIncident(id, { status: newStatus });
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc))
      );
    } catch (err) {
      alert('Failed to update: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdateStatus((prev) => ({ ...prev, [id]: false }));
    }
  };

  const card = { backgroundColor: dark ? '#1e293b' : '#ffffff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', color: dark ? '#e2e8f0' : '#1e293b' };
  const input = { width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, backgroundColor: dark ? '#0f172a' : '#f8fafc', color: dark ? '#e2e8f0' : '#1e293b', fontSize: 14, marginBottom: 10 };
  const btn = (color) => ({ padding: '8px 16px', borderRadius: 6, border: 'none', backgroundColor: color, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 });

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🚨 Incidents</h2>
        <button style={btn('#7c3aed')} onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New Incident'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ marginBottom: 16, padding: 12, borderRadius: 8, backgroundColor: dark ? '#0f172a' : '#f1f5f9', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}` }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Threat Type</label>
          <select style={input} value={form.threat_type} onChange={(e) => setForm({ ...form, threat_type: e.target.value })} required>
            {THREAT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Venue ID</label>
          <input style={input} value={form.venue_id} onChange={(e) => setForm({ ...form, venue_id: e.target.value })} required />
          <label style={{ fontSize: 13, fontWeight: 600 }}>Description</label>
          <textarea style={{ ...input, resize: 'vertical', minHeight: 60 }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the incident…" />
          <button type="submit" style={btn('#ef4444')} disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Incident'}
          </button>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 24, color: dark ? '#94a3b8' : '#64748b' }}>Loading incidents…</div>
      ) : error ? (
        <div style={{ color: '#ef4444', padding: 12, borderRadius: 8, backgroundColor: '#fee2e2', fontSize: 14 }}>{error}</div>
      ) : incidents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 24, color: dark ? '#94a3b8' : '#64748b' }}>No incidents reported</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
          {incidents.map((inc) => (
            <div key={inc.id} style={{ padding: 12, borderRadius: 8, backgroundColor: dark ? '#0f172a' : '#f8fafc', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, borderLeft: `4px solid ${SEVERITY_COLORS[inc.severity] || '#94a3b8'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{inc.id}</span>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 12, backgroundColor: SEVERITY_COLORS[inc.severity] || '#94a3b8', color: '#fff' }}>{inc.severity}</span>
              </div>
              <div style={{ fontSize: 13, marginBottom: 4 }}>
                <strong>Type:</strong> {inc.threat_type} &nbsp;|&nbsp;
                <strong>Status:</strong>&nbsp;
                <span style={{ color: STATUS_COLORS[inc.status] || '#94a3b8', fontWeight: 600 }}>{inc.status}</span>
              </div>
              {inc.location && (
                <div style={{ fontSize: 12, color: dark ? '#64748b' : '#94a3b8' }}>
                  📍 {inc.location.lat}, {inc.location.lng}
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {['INVESTIGATING', 'CONTAINED', 'RESOLVED'].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleUpdateStatus(inc.id, s)}
                    disabled={inc.status === s || updateStatus[inc.id]}
                    style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, border: `1px solid ${STATUS_COLORS[s] || '#94a3b8'}`, backgroundColor: inc.status === s ? STATUS_COLORS[s] : 'transparent', color: inc.status === s ? '#fff' : STATUS_COLORS[s] || '#94a3b8', cursor: inc.status === s ? 'default' : 'pointer', fontWeight: 600 }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 12, color: dark ? '#64748b' : '#94a3b8', textAlign: 'right' }}>
        Auto-refreshes every 10 s
      </div>
    </div>
  );
}

export default IncidentManager;
