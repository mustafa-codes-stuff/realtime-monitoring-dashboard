/**
 * anomalyDetector.js
 * 
 * Analyzes incoming metrics in real-time using a simple rolling window algorithm.
 * If a new metric value exceeds the rolling average by 40%, it flags it as an anomaly.
 */

class AnomalyDetector {
  constructor(windowSize = 10, thresholdMultiplier = 1.4) {
    this.windowSize = windowSize;
    this.thresholdMultiplier = thresholdMultiplier;
    
    // Maintain a rolling window of history for each metric
    this.history = {
      cpuUsage: [],
      memoryUsage: [],
      requestCount: [],
      errorRate: []
    };
  }

  /**
   * Processes a new metrics object and identifies any anomalies.
   * @param {Object} metrics - The latest metrics payload
   * @returns {Array} List of detected anomalies
   */
  process(metrics) {
    const anomalies = [];
    const metricKeys = ['cpuUsage', 'memoryUsage', 'requestCount', 'errorRate'];

    for (const key of metricKeys) {
      const currentValue = metrics[key];
      const metricHistory = this.history[key];

      if (metricHistory.length >= this.windowSize) {
        // Calculate average of the window
        const sum = metricHistory.reduce((a, b) => a + b, 0);
        const average = sum / metricHistory.length;

        // Check if current value exceeds threshold (40% spike)
        // For errorRate, handle low base averages gracefully to avoid false positives
        const threshold = Math.max(average * this.thresholdMultiplier, key === 'errorRate' ? 3.0 : 0);

        if (currentValue > threshold) {
          anomalies.push({
            id: `${key}-${metrics.timestamp}`, // Unique ID for the frontend
            metric: key,
            currentValue,
            average: +average.toFixed(2),
            timestamp: metrics.timestamp,
            isAnomaly: true
          });
        }
      }

      // Add new value to history and shift out the oldest
      metricHistory.push(currentValue);
      if (metricHistory.length > this.windowSize) {
        metricHistory.shift();
      }
    }

    return anomalies;
  }
}

module.exports = new AnomalyDetector();
