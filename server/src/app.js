/**
 * app.js
 * 
 * Express application entry point. Sets up middleware, REST routes,
 * and initializes the combined HTTP + WebSocket server.
 */

require('dotenv').config({ path: '../.env' }); // Load .env from root
const express = require('express');
const http = require('http');
const cors = require('cors');
const initWebSocketServer = require('./wsServer');
const { explainAnomaly } = require('./aiService');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// REST Route for AI Explanations
app.post('/api/explain', async (req, res) => {
  try {
    const anomalyData = req.body;
    
    if (!anomalyData || !anomalyData.metric) {
      return res.status(400).json({ error: 'Invalid anomaly data provided' });
    }

    const explanation = await explainAnomaly(anomalyData);
    res.json(explanation);
  } catch (error) {
    console.error('Explanation Error:', error);
    res.status(500).json({ error: 'Failed to process AI explanation request' });
  }
});

// Initialize WebSocket Server
initWebSocketServer(server);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server attached on ws://localhost:${PORT}`);
});
