'use client';

/**
 * Dashboard Page
 * 
 * The main entry point for the Real-Time Monitoring Dashboard.
 * Orchestrates the WebSocket connection, global telemetry state,
 * and handles interactions between the anomaly detector and AI explainer.
 */

import { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { fetchExplanation } from '../services/api';
import MetricCard from '../components/MetricCard';
import LiveChart from '../components/LiveChart';
import AnomalyPanel from '../components/AnomalyPanel';
import ExplanationPanel from '../components/ExplanationPanel';
import { LayoutDashboard, Activity, Database, Server } from 'lucide-react';

export default function Dashboard() {
  // Use environment variable for WebSocket URL or fallback to localhost
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
  
  // Custom hook handles connection lifecycle and data buffering
  const { currentData, dataHistory, anomalies, isConnected } = useWebSocket(wsUrl);

  // State for AI Analysis workflow
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Triggers the AI explanation flow.
   * Sends the anomaly details plus a small snippet of historical context to Claude.
   */
  const handleExplain = async (anomaly) => {
    setSelectedAnomaly(anomaly);
    setLoading(true);
    setExplanation(null);

    try {
      // We send the current anomaly and the last 5 data points to give the LLM temporal context
      const context = {
        ...anomaly,
        recentHistory: dataHistory.slice(-5)
      };
      const result = await fetchExplanation(context);
      setExplanation(result);
    } catch (error) {
      console.error('Failed to get explanation:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Helper to determine if a specific metric is currently in an anomalous state
   */
  const isMetricAnomalous = (metricName) => {
    // Check if the most recent anomalies list contains this metric
    return anomalies.some(a => a.metric === metricName && 
      (new Date() - new Date(a.timestamp)) < 5000); // Only highlight if it happened in last 5s
  };

  return (
    <main className="min-h-screen bg-black text-gray-100 p-6 font-sans">
      {/* Header Bar */}
      <header className="flex justify-between items-center mb-8 bg-gray-900/50 p-4 rounded-xl border border-gray-800 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Real-Time Monitoring Dashboard</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5 font-semibold">Live System Telemetry & AI Diagnostics</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/80 border border-gray-700">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'} ${isConnected ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{isConnected ? 'WS Connected' : 'WS Disconnected'}</span>
          </div>
          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Metrics & Charts */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Real-time KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard 
              title="CPU Usage" 
              value={currentData?.cpuUsage} 
              unit="%" 
              isAnomaly={isMetricAnomalous('cpuUsage')}
            />
            <MetricCard 
              title="Memory Usage" 
              value={currentData?.memoryUsage} 
              unit="%" 
              isAnomaly={isMetricAnomalous('memoryUsage')}
            />
            <MetricCard 
              title="Request Count" 
              value={currentData?.requestCount} 
              unit="/s" 
              isAnomaly={isMetricAnomalous('requestCount')}
            />
            <MetricCard 
              title="Error Rate" 
              value={currentData?.errorRate} 
              unit="%" 
              isAnomaly={isMetricAnomalous('errorRate')}
            />
          </div>

          {/* Main Visualizer */}
          <section className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800 shadow-inner">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold">Telemetry Stream (Live)</h2>
              </div>
              <div className="flex gap-4 text-[10px] uppercase font-bold tracking-widest">
                <span className="flex items-center gap-1.5 text-blue-400"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> CPU</span>
                <span className="flex items-center gap-1.5 text-purple-400"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full" /> MEM</span>
                <span className="flex items-center gap-1.5 text-emerald-400"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> REQ</span>
                <span className="flex items-center gap-1.5 text-red-400"><div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> ERR</span>
              </div>
            </div>
            <LiveChart data={dataHistory} />
          </section>

          {/* Infrastructure Context Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/20 p-4 rounded-xl border border-gray-800/50 flex items-center gap-3">
              <Database className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Backend Source</p>
                <p className="text-sm font-semibold text-gray-300">Express + ws://{wsUrl.split('//')[1]}</p>
              </div>
            </div>
            <div className="bg-gray-900/20 p-4 rounded-xl border border-gray-800/50 flex items-center gap-3">
              <Server className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">AI Analysis Engine</p>
                <p className="text-sm font-semibold text-gray-300">Claude 3.5 Sonnet</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Intelligence & Alerts */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="h-[400px]">
            <AnomalyPanel 
              anomalies={anomalies} 
              onExplain={handleExplain} 
              selectedAnomalyId={selectedAnomaly?.id}
            />
          </div>
          <div className="flex-1 min-h-[400px]">
            <ExplanationPanel 
              explanation={explanation} 
              loading={loading} 
              selectedAnomaly={selectedAnomaly}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
