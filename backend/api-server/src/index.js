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
  const { incident_id, resource_id } = req.body;
  res.json({
    incident_id,
    resource_id,
    allocated_at: new Date(),
    status: 'ALLOCATED'
  });
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