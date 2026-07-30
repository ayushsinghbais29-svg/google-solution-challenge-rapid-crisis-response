import React, { useState } from 'react';
import Modal from './Modal';

interface AlertForm {
  alert_type: string;
  message: string;
  recipients: string[];
}

interface Props {
  onNotify: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const ALERT_TYPES = [
  { value: 'EVACUATION', label: '🚪 Evacuation Alert', description: 'Order immediate evacuation' },
  { value: 'FIRE', label: '🔥 Fire Alert', description: 'Report active fire' },
  { value: 'MEDICAL', label: '🏥 Medical Emergency', description: 'Medical assistance needed' },
  { value: 'SECURITY', label: '🔒 Security Breach', description: 'Security incident detected' },
  { value: 'ALL_CLEAR', label: '✅ All Clear', description: 'Situation resolved' },
  { value: 'DRILL', label: '📋 Drill Exercise', description: 'Practice emergency drill' },
];

const RECIPIENT_GROUPS = ['All Staff', 'First Responders', 'Security Team', 'Medical Team', 'Management', 'Building Occupants'];

const SendAlert: React.FC<Props> = ({ onNotify }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<{ message?: string; recipients?: string }>({});

  const [form, setForm] = useState<AlertForm>({
    alert_type: 'EVACUATION',
    message: '',
    recipients: ['All Staff'],
  });

  const validate = (): boolean => {
    const newErrors: { message?: string; recipients?: string } = {};
    if (!form.message.trim()) newErrors.message = 'Alert message is required';
    if (form.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';
    if (form.recipients.length === 0) newErrors.recipients = 'Select at least one recipient group';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleRecipient = (group: string) => {
    setForm((prev) => ({
      ...prev,
      recipients: prev.recipients.includes(group)
        ? prev.recipients.filter((r) => r !== group)
        : [...prev.recipients, group],
    }));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      onNotify(`🚨 ${form.alert_type} alert sent to ${form.recipients.join(', ')}`, 'success');
      setIsOpen(false);
      setConfirmed(false);
      setForm({ alert_type: 'EVACUATION', message: '', recipients: ['All Staff'] });
    } catch {
      onNotify('❌ Failed to send alert', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = ALERT_TYPES.find((a) => a.value === form.alert_type);

  return (
    <div className="card">
      <h2 className="card-title">📢 Alert System</h2>

      <div className="metric">
        <span className="metric-label">Active Alerts</span>
        <span className="metric-value severity-critical">2</span>
      </div>
      <div className="metric">
        <span className="metric-label">Recipients Online</span>
        <span className="metric-value">47</span>
      </div>
      <div className="metric">
        <span className="metric-label">Last Alert Sent</span>
        <span className="metric-value">5 min ago</span>
      </div>

      <button className="button button-danger" style={{ background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' }} onClick={() => setIsOpen(true)}>
        🚨 Send Alert
      </button>

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); setConfirmed(false); }} title="🚨 Send Emergency Alert">
        <form onSubmit={handleSend}>
          <div className="form-group">
            <label>Alert Type *</label>
            <select
              value={form.alert_type}
              onChange={(e) => { setForm({ ...form, alert_type: e.target.value }); setConfirmed(false); }}
            >
              {ALERT_TYPES.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
            {selectedType && (
              <div style={{ fontSize: '0.82rem', color: '#888', marginTop: 4 }}>{selectedType.description}</div>
            )}
          </div>

          <div className="form-group">
            <label>Alert Message *</label>
            <textarea
              value={form.message}
              onChange={(e) => { setForm({ ...form, message: e.target.value }); setConfirmed(false); }}
              placeholder="Enter the alert message to be broadcast..."
              rows={3}
            />
            {errors.message && <div className="form-error">{errors.message}</div>}
            <div style={{ fontSize: '0.78rem', color: '#aaa', textAlign: 'right' }}>{form.message.length} chars</div>
          </div>

          <div className="form-group">
            <label>Recipients *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {RECIPIENT_GROUPS.map((group) => (
                <label
                  key={group}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                    padding: '6px 12px', borderRadius: 20,
                    background: form.recipients.includes(group) ? '#667eea' : '#f0f0f0',
                    color: form.recipients.includes(group) ? 'white' : '#333',
                    fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ display: 'none' }}
                    checked={form.recipients.includes(group)}
                    onChange={() => { toggleRecipient(group); setConfirmed(false); }}
                  />
                  {group}
                </label>
              ))}
            </div>
            {errors.recipients && <div className="form-error">{errors.recipients}</div>}
          </div>

          {confirmed && (
            <div style={{
              background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8,
              padding: '12px 14px', marginBottom: 14, fontSize: '0.9rem'
            }}>
              ⚠️ <strong>Confirm sending:</strong> This will broadcast a <strong>{selectedType?.label}</strong> alert to <strong>{form.recipients.join(', ')}</strong>. Click "Send Alert" again to confirm.
            </div>
          )}

          <div className="button-group">
            <button type="submit" className="button button-danger" disabled={loading}
              style={{ background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' }}>
              {loading ? <><span className="spinner" /> Sending…</> : confirmed ? '⚠️ Confirm & Send' : '📢 Send Alert'}
            </button>
            <button type="button" className="button button-secondary" onClick={() => { setIsOpen(false); setConfirmed(false); }}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SendAlert;
