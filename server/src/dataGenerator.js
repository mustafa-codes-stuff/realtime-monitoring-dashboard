/**
 * dataGenerator.js
 * 
 * Simulates a continuous stream of system metrics.
 * Emits regular telemetry data every 2 seconds.
 * Randomly injects a significant spike (anomaly) into one of the metrics every 15-20 seconds.
 */

const { EventEmitter } = require('events');

class DataGenerator extends EventEmitter {
  constructor() {
    super();
    this.intervalId = null;
    this.spikeTimeoutId = null;
    this.isSpiking = false;
    this.spikedMetric = null;
  }

  start() {
    // Emit regular data every 2 seconds
    this.intervalId = setInterval(() => this.generateAndEmit(), 2000);
    this.scheduleNextSpike();
    // Emit the first immediately so we don't wait 2 seconds for initial data
    this.generateAndEmit();
  }

  stop() {
    clearInterval(this.intervalId);
    clearTimeout(this.spikeTimeoutId);
  }

  scheduleNextSpike() {
    // Random delay between 15 to 20 seconds
    const delay = Math.floor(Math.random() * 5000) + 15000;
    this.spikeTimeoutId = setTimeout(() => {
      this.injectSpike();
    }, delay);
  }

  injectSpike() {
    this.isSpiking = true;
    const metrics = ['cpuUsage', 'memoryUsage', 'requestCount', 'errorRate'];
    this.spikedMetric = metrics[Math.floor(Math.random() * metrics.length)];
    
    // The spike lasts for one emission cycle (around 2.5s to ensure one tick catches it)
    setTimeout(() => {
      this.isSpiking = false;
      this.spikedMetric = null;
      this.scheduleNextSpike();
    }, 2500); 
  }

  generateAndEmit() {
    const timestamp = new Date().toISOString();
    
    // Base normal values representing a healthy system
    const metrics = {
      timestamp,
      cpuUsage: Math.floor(Math.random() * 20) + 30, // 30-50%
      memoryUsage: Math.floor(Math.random() * 15) + 40, // 40-55%
      requestCount: Math.floor(Math.random() * 50) + 100, // 100-150 reqs
      errorRate: +(Math.random() * 1).toFixed(2), // 0-1%
    };

    // Override with spike if currently spiking
    if (this.isSpiking && this.spikedMetric) {
      switch (this.spikedMetric) {
        case 'cpuUsage':
          metrics.cpuUsage = Math.floor(Math.random() * 10) + 90; // 90-100%
          break;
        case 'memoryUsage':
          metrics.memoryUsage = Math.floor(Math.random() * 10) + 85; // 85-95%
          break;
        case 'requestCount':
          metrics.requestCount = Math.floor(Math.random() * 100) + 400; // 400-500 reqs
          break;
        case 'errorRate':
          metrics.errorRate = +(Math.random() * 3 + 6).toFixed(2); // 6-9%
          break;
      }
    }

    this.emit('data', metrics);
  }
}

module.exports = new DataGenerator();
