const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Simulate Gemini API calls
async function analyzeWithGemini(incidentDescription) {
  // In production, this would call Google Gemini API
  return {
    threat_type: 'ELECTRICAL_FIRE',
    confidence: 0.94,
    entities: ['fire', 'stove', 'kitchen', 'smoke'],
    immediate_actions: [
      'Evacuate kitchen staff immediately',
      'Alert nearby guests',
      'Activate fire suppression system',
      'Shut off gas lines',
      'Prepare first aid stations',
      'Contact emergency services'
    ],
    risks: [
      'Rapid spread potential',
      'Smoke inhalation hazard',
      'Panic evacuation risk',
      'Re-ignition possibility'
    ],
    recommended_resources: [
      'Fire extinguishers (Type C)',
      'Emergency oxygen',
      'First aid kits',
      'Evacuation guides'
    ]
  };
}

// Analyze incident endpoint
app.post('/analyze', async (req, res) => {
  try {
    const { description } = req.body;
    
    const analysis = await analyzeWithGemini(description);
    
    res.json({
      status: 'success',
      analysis,
      processing_time_ms: Math.random() * 1000 + 800
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'gemini-service' });
});

app.listen(PORT, () => {
  console.log(`✅ Gemini Service running on port ${PORT}`);
});

module.exports = app;