import React, { useState } from 'react';
import Modal from './Modal';

const API_BASE = 'http://localhost:3000';

interface ResourceForm {
  resource_type: string;
  quantity: string;
  priority: string;
  incident_id: string;
  notes: string;
}

interface Props {
  onNotify: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const RESOURCE_TYPES = ['Staff', 'Fire Equipment', 'Medical Kit', 'Vehicle', 'Communication Device', 'Evacuation Gear'];
const PRIORITY_LEVELS = ['Critical', 'High', 'Medium', 'Low'];
const INCIDENT_OPTIONS = ['INC-001', 'INC-002', 'INC-003', 'General Deployment'];

const Resources: React.FC<Props> = ({ onNotify }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ResourceForm>>({});

  const [form, setForm] = useState<ResourceForm>({
    resource_type: 'Staff',
    quantity: '1',
    priority: 'High',
    incident_id: 'INC-001',
    notes: '',
  });

  const validate = (): boolean => {
    const newErrors: Partial<ResourceForm> = {};
    const qty = Number(form.quantity);
    if (!form.quantity || isNaN(qty) || qty < 1) newErrors.quantity = 'Enter a valid quantity (≥ 1)';
    if (qty > 100) newErrors.quantity = 'Maximum 100 units per request';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/resources/allocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource_type: form.resource_type,
          quantity: Number(form.quantity),
          priority: form.priority,
          incident_id: form.incident_id,
          notes: form.notes,
        }),
      });
      if (!response.ok) throw new Error('Failed to allocate resources');
      onNotify(`✅ ${form.quantity}x ${form.resource_type} allocated to ${form.incident_id}`, 'success');
      setIsOpen(false);
      setForm({ resource_type: 'Staff', quantity: '1', priority: 'High', incident_id: 'INC-001', notes: '' });
    } catch {
      onNotify('❌ Resource allocation failed. Check API connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">👥 Resources</h2>

      <div className="metric">
        <span className="metric-label">Staff Available</span>
        <span className="metric-value" style={{ color: '#27ae60' }}>12</span>
      </div>
      <div className="metric">
        <span className="metric-label">Equipment Ready</span>
        <span className="metric-value" style={{ color: '#27ae60' }}>8</span>
      </div>
      <div className="metric">
        <span className="metric-label">Vehicles Available</span>
        <span className="metric-value" style={{ color: '#27ae60' }}>3</span>
      </div>
      <div className="metric">
        <span className="metric-label">Avg. Response Time</span>
        <span className="metric-value">3 min</span>
      </div>

      <button className="button" onClick={() => setIsOpen(true)}>
        📦 Allocate Resources
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="📦 Allocate Resources">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Resource Type *</label>
              <select value={form.resource_type} onChange={(e) => setForm({ ...form, resource_type: e.target.value })}>
                {RESOURCE_TYPES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="Enter quantity"
              />
              {errors.quantity && <div className="form-error">{errors.quantity}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority Level *</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {PRIORITY_LEVELS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Assign to Incident *</label>
              <select value={form.incident_id} onChange={(e) => setForm({ ...form, incident_id: e.target.value })}>
                {INCIDENT_OPTIONS.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional deployment instructions..."
              rows={3}
            />
          </div>

          <div style={{ background: '#f0f4ff', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: '0.88rem', color: '#555' }}>
            <strong>📋 Summary:</strong> Allocating <strong>{form.quantity}x {form.resource_type}</strong> with <strong>{form.priority}</strong> priority to <strong>{form.incident_id}</strong>
          </div>

          <div className="button-group">
            <button type="submit" className="button" disabled={loading}>
              {loading ? <><span className="spinner" /> Allocating…</> : '✅ Confirm Allocation'}
            </button>
            <button type="button" className="button button-secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Resources;
