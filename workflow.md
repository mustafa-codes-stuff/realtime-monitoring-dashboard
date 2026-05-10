# Real-Time Monitoring Dashboard: System Architecture & Workflow

This guide explains the technical design, data flow, and logic behind the Real-Time Monitoring Dashboard. It is designed to help developers and interviewers understand how the system achieves real-time telemetry with AI-powered anomaly analysis.

---

## 1. System Overview

The application is a full-stack real-time monitoring tool that simulates a live production environment. It consists of three primary layers:
1.  **Data Generation & Anomaly Detection (Backend)**
2.  **Streaming Data Layer (WebSocket Server)**
3.  **Visualisation & Intelligence Layer (Frontend + AI API)**

---

## 2. Technology Stack & Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | Next.js (App Router) | Modern React framework for performance, SEO-friendly routing, and built-in API proxies. |
| **Styling** | Tailwind CSS | Utility-first CSS for rapid development of a clean, responsive, dark-themed UI. |
| **Charts** | Recharts | Composable and responsive line charts that handle real-time data updates efficiently. |
| **Backend** | Node.js + Express | Lightweight and highly efficient for I/O bound tasks like streaming metrics. |
| **Streaming** | `ws` (WebSockets) | Provides low-latency, full-duplex communication. Essential for dashboards where data updates every 2 seconds. |
| **AI Analysis** | Claude 3.5 Sonnet | Used for its exceptional reasoning and ability to follow strict JSON formatting instructions for technical diagnostic tasks. |

---

## 3. Core Workflows

### 3.1 Data Generation (The "Heartbeat")
- **File**: `server/src/dataGenerator.js`
- The system doesn't rely on a real database; instead, it uses a simulator that emits a "heartbeat" payload every 2 seconds.
- It mimics real-world scenarios by randomly injecting "spikes" (e.g., CPU hitting 95% or Error Rate jumping to 8%) every 15-20 seconds.

### 3.2 Real-time Anomaly Detection
- **File**: `server/src/anomalyDetector.js`
- As each metric arrives, the backend maintains a **rolling window** of the last 10 readings.
- A **Simple Statistical Threshold** algorithm compares the current reading against the window's average. If it's >40% above the average, it is flagged as an anomaly.
- This logic is executed *before* broadcasting, so clients receive the metrics and the anomaly flags in a single atomic payload.

### 3.3 WebSocket Streaming
- **File**: `server/src/wsServer.js`
- When a client connects, the server immediately sends a `HISTORY` payload containing the last 20 data points. This ensures the dashboard charts are populated instantly without waiting for 40 seconds of data to arrive.
- Subsequent updates are pushed as `LIVE_DATA` events every 2 seconds.

### 3.4 AI Diagnostic Flow
1.  When an anomaly is flagged on the frontend, the user can click **"Explain with AI"**.
2.  The frontend sends the anomaly details (plus a small historical window for context) to the `/api/explain` route.
3.  The backend calls the **Claude API** with a strictly formatted system prompt.
4.  Claude analyzes the metric relationship (e.g., "high CPU + high requests usually means traffic spike") and returns a structured JSON object.
5.  The dashboard renders this in the `ExplanationPanel` with Likely Cause, Impact, and Recommendations.

---

## 4. Key Logic Decisions

### Why WebSockets over HTTP Polling?
Regular HTTP polling (fetching every 2s) would create significant overhead with headers and handshakes. WebSockets keep a single persistent connection open, reducing latency and server CPU usage, which is critical for high-frequency telemetry.

### Why the Anomaly Detection is on the Backend?
By detecting anomalies on the server, we ensure consistency across all connected clients. It also keeps the frontend "thin," focusing only on rendering the data it receives rather than performing statistical calculations.

### Structured JSON from AI
We force Claude to return *only* JSON using a specific system prompt. This allows the frontend to parse the result into specific UI components (like the red/blue/green callout boxes) rather than just dumping raw text on the screen, making the tool feel more like a professional enterprise product.

---

## 5. Directory Navigation

- `client/app/page.jsx`: Main dashboard container.
- `client/hooks/useWebSocket.js`: Manages the persistent connection state.
- `server/src/app.js`: Express entry point and AI proxy.
- `server/src/dataGenerator.js`: The metrics simulation logic.
