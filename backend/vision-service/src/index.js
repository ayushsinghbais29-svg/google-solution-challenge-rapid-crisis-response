const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Simulate Vision AI detection
async function detectThreats(videoFrame) {
  // In production, this would call Google Vision AI
  return {
    fire_detection: {
      threat_type: 'FIRE',
      confidence: 0.89,
      flame_area_pixels: 45620,
      flame_spread_rate: 'RAPID',
      color_analysis: 'orange-red'
    },
    smoke_detection: {
      threat_type: 'SMOKE',
      confidence: 0.94,
      density_level: 'HEAVY',
      spread_direction: 'upward_eastward'
    },
    person_detection: {
      people_in_danger_zone: 3,
      evacuation_started: true,
      crowding_risk: 'LOW'
    },
    hazard_detection: {
      electrical_hazard: 'CONFIRMED',
      structural_damage: 'NONE_DETECTED',
      secondary_fire_risk: 'MEDIUM'
    }
  };
}

// Detect threats endpoint
app.post('/detect', async (req, res) => {
  try {
    const { frame_data } = req.body;
    
    const detection = await detectThreats(frame_data);
    
    res.json({
      status: 'success',
      detection,
      processing_time_ms: Math.random() * 800 + 500
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'vision-service' });
});

app.listen(PORT, () => {
  console.log(`✅ Vision Service running on port ${PORT}`);
});

module.exports = app;