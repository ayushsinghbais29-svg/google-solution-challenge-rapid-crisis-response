const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('✅ Client connected');
  clients.add(ws);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'CONNECTED',
    message: 'Connected to WebSocket server',
    timestamp: new Date()
  }));

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 Received:', data.type);

      // Broadcast to all clients
      broadcast({
        type: data.type,
        data: data.data,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log('❌ Client disconnected');
    clients.delete(ws);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast function
function broadcast(message) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// REST endpoint to send broadcasts
app.post('/broadcast', express.json(), (req, res) => {
  const { type, data } = req.body;
  
  broadcast({
    type,
    data,
    timestamp: new Date()
  });

  res.json({
    status: 'success',
    clients_notified: clients.size,
    message: 'Broadcast sent'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'websocket-server',
    connected_clients: clients.size
  });
});

server.listen(PORT, () => {
  console.log(`✅ WebSocket Server running on port ${PORT}`);
  console.log(`Connect to: ws://localhost:${PORT}`);
});

module.exports = server;