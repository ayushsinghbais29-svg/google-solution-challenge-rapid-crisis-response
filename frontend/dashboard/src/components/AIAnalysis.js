import React, { useState, useEffect, useCallback } from 'react';
import { getIncident } from '../services/api';

function ProgressBar({ value, color, dark }) {
  return (
    <div style={{ backgroundColor: dark ? '#334155' : '#e2e8f0', borderRadius: 999, height: 8, overflow: 'hidden', marginTop: 4 }}>
      <div
        style={{
          width: `${Math.round(value * 100)}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: 999,
          transition: 'width 0.6s ease',
        }}
      />
    </div>
  );
}

const AI_SERVICES = [
  { key: 'gemini',    label: 'Gemini NLP',    icon: '🧠', color: '#7c3aed' },
  { key: 'vertex_ai', label: 'Vertex AI ML',  icon: '🤖', color: '#2563eb' },
  { key: 'vision_ai', label: 'Vision AI',     icon: '👁️',  color: '#059669' },
];

function AIAnalysis({ dark }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    try {
      const data = await getIncident('INC-001');
      setAnalysis(data.analysis || null);
      setError(null);
    } catch {
      setError('Could not load AI analysis');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
    const interval = setInterval(fetchAnalysis, 8000);
    return () => clearInterval(interval);
  }, [fetchAnalysis]);

  const card = { backgroundColor: dark ? '#1e293b' : '#ffffff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', color: dark ? '#e2e8f0' : '#1e293b' };

  const getConfidence = (key) => {
    if (!analysis) return 0;
    if (key === 'gemini')    return analysis.gemini?.confidence    ?? 0;
    if (key === 'vertex_ai') return analysis.vertex_ai?.confidence ?? 0;
    if (key === 'vision_ai') return analysis.vision_ai?.confidence ?? 0;
    return 0;
  };

  const overallConfidence = analysis
    ? (getConfidence('gemini') + getConfidence('vertex_ai') + getConfidence('vision_ai')) / 3
    : 0;

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🧬 AI Analysis</h2>
        {analysis && (
          <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 12, backgroundColor: '#7c3aed', color: '#fff' }}>
            INC-001
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 24, color: dark ? '#94a3b8' : '#64748b' }}>Loading AI data…</div>
      ) : error ? (
        <div style={{ color: '#ef4444', padding: 12, borderRadius: 8, backgroundColor: '#fee2e2', fontSize: 14 }}>{error}</div>
      ) : (
        <>
          {/* Overall confidence */}
          <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, backgroundColor: dark ? '#0f172a' : '#f8fafc', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: dark ? '#94a3b8' : '#64748b', marginBottom: 4 }}>Overall Assessment</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#7c3aed' }}>
              {analysis?.gemini?.threat || 'ELECTRICAL FIRE'}
            </div>
            <div style={{ fontSize: 13, marginTop: 4, color: dark ? '#94a3b8' : '#64748b' }}>
              Avg Confidence: <strong>{Math.round(overallConfidence * 100)}%</strong>
            </div>
          </div>

          {/* Per-service scores */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {AI_SERVICES.map(({ key, label, icon, color }) => {
              const conf = getConfidence(key);
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span>{icon} {label}</span>
                    <strong style={{ color }}>{Math.round(conf * 100)}%</strong>
                  </div>
                  <ProgressBar value={conf} color={color} dark={dark} />
                </div>
              );
            })}
          </div>

          {/* Expandable details */}
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{ marginTop: 14, padding: '7px 14px', borderRadius: 6, border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, backgroundColor: 'transparent', color: dark ? '#e2e8f0' : '#1e293b', cursor: 'pointer', fontSize: 13, width: '100%' }}
          >
            {expanded ? '▲ Hide Details' : '▼ View Details'}
          </button>

          {expanded && analysis && (
            <div style={{ marginTop: 10, padding: 12, borderRadius: 8, backgroundColor: dark ? '#0f172a' : '#f1f5f9', fontSize: 13, lineHeight: 1.6 }}>
              <div><strong>Gemini:</strong> {analysis.gemini?.threat}, fire_detected: {String(analysis.vision_ai?.fire_detected)}</div>
              <div><strong>Vertex AI:</strong> Severity — {analysis.vertex_ai?.severity}</div>
              <div><strong>Vision AI:</strong> fire_detected={String(analysis.vision_ai?.fire_detected)}</div>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: 12, fontSize: 12, color: dark ? '#64748b' : '#94a3b8', textAlign: 'right' }}>
        Auto-refreshes every 8 s
      </div>
    </div>
  );
}

export default AIAnalysis;
