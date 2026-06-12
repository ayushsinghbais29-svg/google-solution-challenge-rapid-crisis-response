import React, { useState, useEffect, useCallback } from 'react';
import { getResources, allocateResource } from '../services/api';

const TYPE_ICONS = { STAFF: '👤', EQUIPMENT: '🔧', VEHICLE: '🚒', MEDICAL: '💊', DEFAULT: '📦' };
const STATUS_COLORS = { AVAILABLE: '#22c55e', ALLOCATED: '#f97316', MAINTENANCE: '#94a3b8', OFFLINE: '#ef4444' };

function Resources({ dark }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allocating, setAllocating] = useState({});
  const [incidentId, setIncidentId] = useState('INC-001');
  const [notification, setNotification] = useState(null);

  const fetchResources = useCallback(async () => {
    try {
      const data = await getResources();
      setResources(data.resources || []);
      setError(null);
    } catch {
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
    const interval = setInterval(fetchResources, 10000);
    return () => clearInterval(interval);
  }, [fetchResources]);

  const handleAllocate = async (resourceId) => {
    setAllocating((prev) => ({ ...prev, [resourceId]: true }));
    try {
      await allocateResource({ incident_id: incidentId, resource_id: resourceId });
      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, status: 'ALLOCATED' } : r))
      );
      setNotification(`✅ ${resourceId} allocated to ${incidentId}`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      alert('Allocation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setAllocating((prev) => ({ ...prev, [resourceId]: false }));
    }
  };

  const availableCount = resources.filter((r) => r.status === 'AVAILABLE').length;
  const allocatedCount = resources.filter((r) => r.status === 'ALLOCATED').length;

  const card = { backgroundColor: dark ? '#1e293b' : '#ffffff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', color: dark ? '#e2e8f0' : '#1e293b' };
  const inputStyle = { padding: '7px 12px', borderRadius: 6, border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, backgroundColor: dark ? '#0f172a' : '#f8fafc', color: dark ? '#e2e8f0' : '#1e293b', fontSize: 13, flex: 1 };

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🏗️ Resources</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 12, backgroundColor: '#dcfce7', color: '#166534', fontWeight: 700 }}>{availableCount} available</span>
          <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 12, backgroundColor: '#ffedd5', color: '#9a3412', fontWeight: 700 }}>{allocatedCount} allocated</span>
        </div>
      </div>

      {notification && (
        <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8, backgroundColor: '#dcfce7', color: '#166534', fontSize: 13, fontWeight: 600 }}>
          {notification}
        </div>
      )}

      {/* Incident ID input */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <label style={{ fontSize: 13, whiteSpace: 'nowrap', fontWeight: 600 }}>Allocate to:</label>
        <input
          style={inputStyle}
          value={incidentId}
          onChange={(e) => setIncidentId(e.target.value)}
          placeholder="INC-001"
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 24, color: dark ? '#94a3b8' : '#64748b' }}>Loading resources…</div>
      ) : error ? (
        <div style={{ color: '#ef4444', padding: 12, borderRadius: 8, backgroundColor: '#fee2e2', fontSize: 14 }}>{error}</div>
      ) : resources.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 24, color: dark ? '#94a3b8' : '#64748b' }}>No resources available</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
          {resources.map((res) => {
            const icon = TYPE_ICONS[res.type] || TYPE_ICONS.DEFAULT;
            const statusColor = STATUS_COLORS[res.status] || '#94a3b8';
            const isAvailable = res.status === 'AVAILABLE';
            return (
              <div
                key={res.id}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{res.name}</div>
                    <div style={{ fontSize: 12, color: dark ? '#64748b' : '#94a3b8' }}>{res.id} · {res.type}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: statusColor }}>{res.status}</span>
                  {isAvailable && (
                    <button
                      onClick={() => handleAllocate(res.id)}
                      disabled={allocating[res.id]}
                      style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: 'none', backgroundColor: '#7c3aed', color: '#fff', cursor: allocating[res.id] ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                    >
                      {allocating[res.id] ? '…' : 'Allocate'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 12, color: dark ? '#64748b' : '#94a3b8', textAlign: 'right' }}>
        Auto-refreshes every 10 s
      </div>
    </div>
  );
}

export default Resources;
