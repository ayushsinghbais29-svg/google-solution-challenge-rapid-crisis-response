import React, { useState } from 'react';
import Modal from './Modal';

interface ReportConfig {
  report_type: string;
  date_from: string;
  date_to: string;
  format: string;
}

interface Props {
  onNotify: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const REPORT_TYPES = [
  'Incident Summary Report',
  'Resource Allocation Report',
  'AI Analysis Report',
  'Response Time Report',
  'System Health Report',
  'Full Operational Report',
];

const MOCK_INCIDENTS = [
  { id: 'INC-001', type: 'FIRE', severity: 'CRITICAL', status: 'RESOLVED', date: '2024-01-15', response: '3 min' },
  { id: 'INC-002', type: 'MEDICAL', severity: 'WARNING', status: 'ACTIVE', date: '2024-01-16', response: '2 min' },
  { id: 'INC-003', type: 'SECURITY', severity: 'INFO', status: 'RESOLVED', date: '2024-01-17', response: '5 min' },
  { id: 'INC-004', type: 'FLOOD', severity: 'CRITICAL', status: 'RESOLVED', date: '2024-01-18', response: '4 min' },
  { id: 'INC-005', type: 'ELECTRICAL', severity: 'WARNING', status: 'ACTIVE', date: '2024-01-19', response: '3 min' },
];

const GenerateReport: React.FC<Props> = ({ onNotify }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ReportConfig>>({});

  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [form, setForm] = useState<ReportConfig>({
    report_type: REPORT_TYPES[0],
    date_from: sevenDaysAgo,
    date_to: today,
    format: 'PDF',
  });

  const validate = (): boolean => {
    const newErrors: Partial<ReportConfig> = {};
    if (!form.date_from) newErrors.date_from = 'Start date is required';
    if (!form.date_to) newErrors.date_to = 'End date is required';
    if (form.date_from > form.date_to) newErrors.date_to = 'End date must be after start date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((res) => setTimeout(res, 600));
    setLoading(false);
    setShowPreview(true);
  };

  const handleExport = async () => {
    setLoading(true);
    onNotify(`📄 Generating ${form.format} report…`, 'info');
    await new Promise((res) => setTimeout(res, 1200));

    if (form.format === 'CSV') {
      const csvContent = [
        ['ID', 'Type', 'Severity', 'Status', 'Date', 'Response Time'].join(','),
        ...MOCK_INCIDENTS.map((i) => [i.id, i.type, i.severity, i.status, i.date, i.response].join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `crisis-report-${form.date_from}-to-${form.date_to}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // PDF export simulation
      const content = `RAPID CRISIS RESPONSE - ${form.report_type.toUpperCase()}\n` +
        `Period: ${form.date_from} to ${form.date_to}\n` +
        `Generated: ${new Date().toLocaleString()}\n\n` +
        `INCIDENT SUMMARY\n` +
        `================\n` +
        MOCK_INCIDENTS.map((i) => `${i.id} | ${i.type} | ${i.severity} | ${i.status} | ${i.date}`).join('\n');
      const blob = new Blob([content], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `crisis-report-${form.date_from}-to-${form.date_to}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    setLoading(false);
    onNotify(`✅ ${form.format} report exported successfully`, 'success');
  };

  return (
    <div className="card">
      <h2 className="card-title">📋 Reports</h2>

      <div className="metric">
        <span className="metric-label">Reports Generated</span>
        <span className="metric-value">24</span>
      </div>
      <div className="metric">
        <span className="metric-label">Last Report</span>
        <span className="metric-value">2 hours ago</span>
      </div>
      <div className="metric">
        <span className="metric-label">Available Formats</span>
        <span className="metric-value">PDF, CSV</span>
      </div>

      <button className="button" onClick={() => setIsOpen(true)}>
        📊 Generate Report
      </button>

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); setShowPreview(false); }} title="📊 Generate Report" size="large">
        <div>
          <div className="form-group">
            <label>Report Type *</label>
            <select value={form.report_type} onChange={(e) => { setForm({ ...form, report_type: e.target.value }); setShowPreview(false); }}>
              {REPORT_TYPES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>From Date *</label>
              <input
                type="date"
                value={form.date_from}
                max={form.date_to}
                onChange={(e) => { setForm({ ...form, date_from: e.target.value }); setShowPreview(false); }}
              />
              {errors.date_from && <div className="form-error">{errors.date_from}</div>}
            </div>
            <div className="form-group">
              <label>To Date *</label>
              <input
                type="date"
                value={form.date_to}
                min={form.date_from}
                max={today}
                onChange={(e) => { setForm({ ...form, date_to: e.target.value }); setShowPreview(false); }}
              />
              {errors.date_to && <div className="form-error">{errors.date_to}</div>}
            </div>
          </div>

          <div className="form-group">
            <label>Export Format</label>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              {['PDF', 'CSV'].map((fmt) => (
                <label key={fmt} style={{
                  display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                  padding: '8px 16px', borderRadius: 8,
                  border: `2px solid ${form.format === fmt ? '#667eea' : '#ddd'}`,
                  background: form.format === fmt ? '#f0f4ff' : 'white',
                  fontWeight: 600, fontSize: '0.9rem',
                }}>
                  <input type="radio" style={{ display: 'none' }} checked={form.format === fmt} onChange={() => setForm({ ...form, format: fmt })} />
                  {fmt === 'PDF' ? '📄' : '📊'} {fmt}
                </label>
              ))}
            </div>
          </div>

          {showPreview && (
            <div className="report-preview">
              <h3>📋 Preview: {form.report_type}</h3>
              <p style={{ fontSize: '0.82rem', color: '#888', marginBottom: 10 }}>
                Period: {form.date_from} → {form.date_to} | {MOCK_INCIDENTS.length} records found
              </p>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Response</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_INCIDENTS.map((incident) => (
                    <tr key={incident.id}>
                      <td>{incident.id}</td>
                      <td>{incident.type}</td>
                      <td>
                        <span className={`badge badge-${incident.severity.toLowerCase() === 'critical' ? 'critical' : incident.severity.toLowerCase() === 'warning' ? 'warning' : 'info'}`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td>{incident.status}</td>
                      <td>{incident.date}</td>
                      <td>{incident.response}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="button-group">
            <button type="button" className="button button-secondary" onClick={handlePreview} disabled={loading}>
              {loading && !showPreview ? <><span className="spinner" style={{ borderTopColor: '#333' }} /> Loading…</> : '👁️ Preview'}
            </button>
            <button type="button" className="button" onClick={handleExport} disabled={loading || !showPreview}>
              {loading && showPreview ? <><span className="spinner" /> Exporting…</> : `⬇️ Export ${form.format}`}
            </button>
            <button type="button" className="button button-secondary" onClick={() => { setIsOpen(false); setShowPreview(false); }}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GenerateReport;
