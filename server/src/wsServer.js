/**
 * wsServer.js
 * 
 * Sets up the WebSocket server attached to the Express HTTP server.
 * Subscribes to the dataGenerator, runs the anomalyDetector, and broadcasts
 * the combined results to all connected clients.
 */

const { WebSocketServer } = require('ws');
const dataGenerator = require('./dataGenerator');
const anomalyDetector = require('./anomalyDetector');

function initWebSocketServer(server) {
  const wss = new WebSocketServer({ server });
  
  // Maintain the last 20 readings for new connections
  const recentData = [];
  const MAX_HISTORY = 20;

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    // Send immediate history so the UI charts populate instantly
    ws.send(JSON.stringify({
      type: 'HISTORY',
      data: recentData
    }));

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  // Listen for generated data
  dataGenerator.on('data', (metrics) => {
    // Run anomaly detection
    const anomalies = anomalyDetector.process(metrics);
    
    const payload = {
      type: 'LIVE_DATA',
      metrics,
      anomalies
    };

    // Store in history
    recentData.push(payload);
    if (recentData.length > MAX_HISTORY) {
      recentData.shift();
    }

    // Broadcast to all active clients
    const payloadStr = JSON.stringify(payload);
    wss.clients.forEach((client) => {
      if (client.readyState === 1 /* WebSocket.OPEN */) {
        client.send(payloadStr);
      }
    });
  });

  // Start the generator
  dataGenerator.start();
  
  return wss;
}

module.exports = initWebSocketServer;
