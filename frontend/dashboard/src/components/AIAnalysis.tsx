import React, { useState } from 'react';
import Modal from './Modal';

interface AIModel {
  name: string;
  confidence: number;
  assessment: string;
  recommendations: string[];
}

interface Props {
  onNotify: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const AI_MODELS: AIModel[] = [
  {
    name: 'Gemini NLP',
    confidence: 94,
    assessment: 'ELECTRICAL FIRE',
    recommendations: [
      'Evacuate all personnel from affected zone immediately',
      'Cut power to the affected circuit breaker',
      'Deploy CO2 fire extinguishers only — no water near electrical fires',
      'Contact the building electrical engineer',
    ],
  },
  {
    name: 'Vertex AI ML',
    confidence: 96,
    assessment: 'CRITICAL THREAT',
    recommendations: [
      'Activate emergency protocol EL-7',
      'Deploy 12 personnel — 4 evacuation coordinators, 3 fire suppression, 2 medical, 3 security',
      'Estimated resolution: 15 minutes',
      'Guest panic risk: HIGH — initiate calm communication broadcast',
    ],
  },
  {
    name: 'Vision AI',
    confidence: 89,
    assessment: 'FIRE DETECTED',
    recommendations: [
      'Visual confirmation: smoke and flame detected in east wing',
      'Sprinkler system status: ACTIVE',
      'Occupancy estimate: 47 individuals in affected zone',
      'Nearest exit route: North corridor (clear)',
    ],
  },
];

const AIAnalysis: React.FC<Props> = ({ onNotify }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    onNotify('🤖 Running AI analysis…', 'info');
    await new Promise((res) => setTimeout(res, 1500));
    setAnalyzing(false);
    setIsOpen(true);
  };

  const overallConfidence = Math.round(AI_MODELS.reduce((sum, m) => sum + m.confidence, 0) / AI_MODELS.length);

  return (
    <div className="card">
      <h2 className="card-title">🤖 AI Analysis</h2>

      {AI_MODELS.map((model) => (
        <div key={model.name} className="metric">
          <span className="metric-label">{model.name}</span>
          <span className="metric-value">{model.confidence}% Confidence</span>
        </div>
      ))}

      <div className="metric">
        <span className="metric-label">Overall Assessment</span>
        <span className="metric-value severity-critical">{AI_MODELS[0].assessment}</span>
      </div>

      <button className="button" onClick={handleAnalyze} disabled={analyzing}>
        {analyzing ? <><span className="spinner" /> Analyzing…</> : '🔍 View Details'}
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="🤖 AI Analysis Breakdown" size="large">
        <div>
          <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', marginBottom: 18 }}>
            <div style={{ fontWeight: 700, color: '#333', marginBottom: 6 }}>Overall AI Confidence</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="confidence-track" style={{ flex: 1 }}>
                <div className="confidence-fill" style={{ width: `${overallConfidence}%` }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#667eea' }}>{overallConfidence}%</span>
            </div>
          </div>

          {AI_MODELS.map((model) => (
            <div key={model.name} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ color: '#333', fontSize: '1rem' }}>{model.name}</h3>
                <span className="badge badge-warning">{model.assessment}</span>
              </div>

              <div className="confidence-bar">
                <span className="confidence-label">Confidence</span>
                <div className="confidence-track">
                  <div className="confidence-fill" style={{ width: `${model.confidence}%` }} />
                </div>
                <span className="confidence-pct">{model.confidence}%</span>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555', marginBottom: 4 }}>Recommendations:</div>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {model.recommendations.map((rec, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', color: '#444', marginBottom: 3, lineHeight: 1.4 }}>{rec}</li>
                  ))}
                </ul>
              </div>

              <hr style={{ margin: '14px 0', borderColor: '#eee' }} />
            </div>
          ))}

          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, padding: '12px 16px' }}>
            <strong>⚡ Immediate Action Required:</strong>
            <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: '#555' }}>
              All three AI models agree this is a critical electrical fire. Initiate evacuation protocol immediately and deploy emergency response team.
            </p>
          </div>

          <button className="button" style={{ marginTop: 16 }} onClick={() => setIsOpen(false)}>
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AIAnalysis;
