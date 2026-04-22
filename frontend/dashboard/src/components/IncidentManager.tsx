import React, { useState } from 'react';
import Modal from './Modal';

const API_BASE = 'http://localhost:3000';

interface Incident {
  id: string;
  threat_type: string;
  severity: string;
  status: string;
  location?: { lat: number; lng: number };
  description?: string;
  created_at?: string;
}

interface NewIncidentForm {
  threat_type: string;
  severity: string;
  location_lat: string;
  location_lng: string;
  description: string;
  venue_id: string;
}

interface Props {
  incidents: Incident[];
  onIncidentCreated: (incident: Incident) => void;
  onNotify: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const THREAT_TYPES = ['FIRE', 'FLOOD', 'EARTHQUAKE', 'ELECTRICAL', 'MEDICAL', 'SECURITY', 'CHEMICAL', 'OTHER'];
const SEVERITY_LEVELS = ['Critical', 'Warning', 'Info'];

const IncidentManager: React.FC<Props> = ({ incidents, onIncidentCreated, onNotify }) => {
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<NewIncidentForm>>({});

  const [form, setForm] = useState<NewIncidentForm>({
    threat_type: 'FIRE',
    severity: 'Critical',
    location_lat: '40.7128',
    location_lng: '-74.0060',
    description: '',
    venue_id: 'venue-001',
  });

  const validate = (): boolean => {
    const newErrors: Partial<NewIncidentForm> = {};
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.location_lat || isNaN(Number(form.location_lat))) newErrors.location_lat = 'Valid latitude required';
    if (!form.location_lng || isNaN(Number(form.location_lng))) newErrors.location_lng = 'Valid longitude required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue_id: form.venue_id,
          threat_type: form.threat_type,
          severity: form.severity.toUpperCase(),
          location: { lat: Number(form.location_lat), lng: Number(form.location_lng) },
          description: form.description,
        }),
      });
      if (!response.ok) throw new Error('Failed to create incident');
      const data = await response.json();
      onIncidentCreated(data);
      onNotify(`✅ Incident ${data.id} created successfully`, 'success');
      setIsNewOpen(false);
      setForm({ threat_type: 'FIRE', severity: 'Critical', location_lat: '40.7128', location_lng: '-74.0060', description: '', venue_id: 'venue-001' });
    } catch {
      onNotify('❌ Failed to create incident. Check API connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const severityClass = (severity: string) => {
    if (severity === 'CRITICAL') return 'critical';
    if (severity === 'WARNING' || severity === 'WARN') return 'warning';
    return '';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="card">
      <h2 className="card-title">🚨 Active Incidents</h2>

      <ul className="incident-list">
        {incidents.length > 0 ? (
          incidents.map((incident) => (
            <li
              key={incident.id}
              className={`incident-item ${severityClass(incident.severity)}`}
              style={{ cursor: 'pointer' }}
              onClick={() => { setSelectedIncident(incident); setIsDetailOpen(true); }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="incident-id">{incident.id}</span>
                <span className={`badge badge-${severityClass(incident.severity) || 'info'}`}>{incident.severity}</span>
              </div>
              <div className="incident-meta">
                <strong>{incident.threat_type}</strong> · {incident.status}
              </div>
            </li>
          ))
        ) : (
          <li className="incident-item" style={{ color: '#888', textAlign: 'center' }}>
            No active incidents
          </li>
        )}
      </ul>

      <button className="button" onClick={() => setIsNewOpen(true)}>
        ➕ New Incident
      </button>

      {/* New Incident Modal */}
      <Modal isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} title="➕ Create New Incident">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Incident ID (auto-generated)</label>
            <input type="text" value={`INC-${Date.now()}`} disabled style={{ background: '#f5f5f5', color: '#888' }} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Threat Type *</label>
              <select value={form.threat_type} onChange={(e) => setForm({ ...form, threat_type: e.target.value })}>
                {THREAT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Severity Level *</label>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                {SEVERITY_LEVELS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude *</label>
              <input
                type="number"
                step="any"
                value={form.location_lat}
                onChange={(e) => setForm({ ...form, location_lat: e.target.value })}
                placeholder="e.g. 40.7128"
              />
              {errors.location_lat && <div className="form-error">{errors.location_lat}</div>}
            </div>
            <div className="form-group">
              <label>Longitude *</label>
              <input
                type="number"
                step="any"
                value={form.location_lng}
                onChange={(e) => setForm({ ...form, location_lng: e.target.value })}
                placeholder="e.g. -74.0060"
              />
              {errors.location_lng && <div className="form-error">{errors.location_lng}</div>}
            </div>
          </div>

          <div className="form-group">
            <label>Venue ID</label>
            <input type="text" value={form.venue_id} onChange={(e) => setForm({ ...form, venue_id: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the incident in detail..."
              rows={3}
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>

          <div className="button-group">
            <button type="submit" className="button" disabled={loading}>
              {loading ? <><span className="spinner" /> Submitting…</> : '🚨 Create Incident'}
            </button>
            <button type="button" className="button button-secondary" onClick={() => setIsNewOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Incident Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`📋 Incident Details: ${selectedIncident?.id}`}>
        {selectedIncident && (
          <div>
            <div className="metric">
              <span className="metric-label">Incident ID</span>
              <span className="metric-value">{selectedIncident.id}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Threat Type</span>
              <span className="metric-value">{selectedIncident.threat_type}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Severity</span>
              <span className={`metric-value severity-${selectedIncident.severity.toLowerCase()}`}>{selectedIncident.severity}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Status</span>
              <span className="metric-value">{selectedIncident.status}</span>
            </div>
            {selectedIncident.location && (
              <div className="metric">
                <span className="metric-label">Location</span>
                <span className="metric-value">({selectedIncident.location.lat}, {selectedIncident.location.lng})</span>
              </div>
            )}
            {selectedIncident.description && (
              <div className="metric">
                <span className="metric-label">Description</span>
                <span className="metric-value">{selectedIncident.description}</span>
              </div>
            )}
            {selectedIncident.created_at && (
              <div className="metric">
                <span className="metric-label">Created At</span>
                <span className="metric-value">{formatDate(selectedIncident.created_at)}</span>
              </div>
            )}
            <button className="button" style={{ marginTop: 16 }} onClick={() => setIsDetailOpen(false)}>
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IncidentManager;
