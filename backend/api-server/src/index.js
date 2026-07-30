const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ==================== ROUTES ====================

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    service: 'api-server'
  });
});

// ==================== INCIDENTS ====================

// Get all incidents
app.get('/api/incidents', (req, res) => {
  res.json({ 
    incidents: [
      {
        id: 'INC-001',
        venue_id: 'venue-001',
        threat_type: 'FIRE',
        severity: 'CRITICAL',
        status: 'ACTIVE',
        created_at: new Date(),
        location: { lat: 40.7128, lng: -74.0060 }
      }
    ]
  });
});

// Create incident
app.post('/api/incidents', (req, res) => {
  const { venue_id, threat_type, location, description } = req.body;
  
  res.status(201).json({ 
    id: 'INC-' + Date.now(),
    venue_id,
    threat_type,
    location,
    description,
    status: 'REPORTED',
    severity: 'PENDING_ANALYSIS',
    created_at: new Date()
  });
});

// Get incident details
app.get('/api/incidents/:id', (req, res) => {
  res.json({
    id: req.params.id,
    venue_id: 'venue-001',
    threat_type: 'FIRE',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    created_at: new Date(),
    analysis: {
      gemini: { threat: 'ELECTRICAL_FIRE', confidence: 0.94 },
      vertex_ai: { severity: 'CRITICAL', confidence: 0.96 },
      vision_ai: { fire_detected: true, confidence: 0.89 }
    }
  });
});

// Update incident status
app.put('/api/incidents/:id', (req, res) => {
  const { status } = req.body;
  res.json({
    id: req.params.id,
    status,
    updated_at: new Date()
  });
});

// ==================== RESOURCES ====================

app.get('/api/resources', (req, res) => {
  res.json({
    resources: [
      { id: 'RES-001', type: 'STAFF', name: 'John', status: 'AVAILABLE' },
      { id: 'RES-002', type: 'EQUIPMENT', name: 'Fire Extinguisher', status: 'AVAILABLE' }
    ]
  });
});

app.post('/api/resources/allocate', (req, res) => {
  const { incident_id, resource_id, resource_type, quantity, priority, notes } = req.body;
  res.json({
    incident_id,
    resource_id,
    resource_type,
    quantity,
    priority,
    notes,
    allocated_at: new Date(),
    status: 'ALLOCATED'
  });
});

// ==================== ANALYTICS ====================

app.get('/api/analytics', (req, res) => {
  res.json({
    incident_trend: [
      { label: 'Mon', value: 3 },
      { label: 'Tue', value: 7 },
      { label: 'Wed', value: 5 },
      { label: 'Thu', value: 12 },
      { label: 'Fri', value: 8 },
      { label: 'Sat', value: 4 },
      { label: 'Sun', value: 6 }
    ],
    response_times: [
      { label: 'Mon', value: 4 },
      { label: 'Tue', value: 3 },
      { label: 'Wed', value: 5 },
      { label: 'Thu', value: 2 },
      { label: 'Fri', value: 3 },
      { label: 'Sat', value: 4 },
      { label: 'Sun', value: 3 }
    ],
    ai_confidence_trend: [
      { label: 'Mon', value: 88 },
      { label: 'Tue', value: 91 },
      { label: 'Wed', value: 89 },
      { label: 'Thu', value: 94 },
      { label: 'Fri', value: 93 },
      { label: 'Sat', value: 96 },
      { label: 'Sun', value: 94 }
    ],
    service_health: [
      { service: 'API Server', uptime: 99.8 },
      { service: 'Gemini Service', uptime: 97.5 },
      { service: 'Vertex AI', uptime: 98.2 },
      { service: 'Vision Service', uptime: 96.9 },
      { service: 'WebSocket', uptime: 99.1 }
    ]
  });
});

// ==================== ALERTS ====================

app.post('/api/alerts', (req, res) => {
  const { alert_type, message, recipients } = req.body;
  res.status(201).json({
    id: 'ALERT-' + Date.now(),
    alert_type,
    message,
    recipients,
    sent_at: new Date(),
    status: 'SENT'
  });
});

app.get('/api/alerts', (req, res) => {
  res.json({
    alerts: [
      { id: 'ALERT-001', alert_type: 'FIRE', message: 'Fire detected in east wing', sent_at: new Date(), status: 'SENT' },
      { id: 'ALERT-002', alert_type: 'EVACUATION', message: 'Evacuation in progress', sent_at: new Date(), status: 'SENT' }
    ]
  });
});

// ==================== LOGS ====================

app.get('/api/logs', (req, res) => {
  const { level, limit = 50 } = req.query;
  const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
  const services = ['api-server', 'gemini-service', 'vertex-ai', 'vision-service'];
  const messages = {
    ERROR: ['Connection timeout', 'Authentication failed', 'API rate limit exceeded'],
    WARN: ['High memory usage', 'Response time slow', 'Cache miss rate high'],
    INFO: ['Incident updated', 'Resource allocated', 'Health check passed'],
    DEBUG: ['Query executed in 12ms', 'Cache hit', 'Token refreshed']
  };

  const logs = Array.from({ length: Number(limit) }, (_, i) => {
    const logLevel = level && level !== 'ALL' ? String(level) : levels[Math.floor(Math.random() * levels.length)];
    const service = services[Math.floor(Math.random() * services.length)];
    const msgList = messages[logLevel] || messages['INFO'];
    return {
      id: i + 1,
      timestamp: new Date(Date.now() - i * 2000).toISOString(),
      level: logLevel,
      service,
      message: msgList[Math.floor(Math.random() * msgList.length)]
    };
  });

  res.json({ logs, total: logs.length });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`✅ API Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;