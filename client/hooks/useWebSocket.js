import { useState, useEffect, useRef } from 'react';

export function useWebSocket(url) {
  const [dataHistory, setDataHistory] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    
    ws.onclose = () => setIsConnected(false);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        
        if (payload.type === 'HISTORY') {
          setDataHistory(payload.data.map(d => d.metrics));
          // Extract anomalies from history if they exist
          const historyAnomalies = payload.data.flatMap(d => d.anomalies || []);
          setAnomalies(historyAnomalies);
        } else if (payload.type === 'LIVE_DATA') {
          setDataHistory(prev => {
            const next = [...prev, payload.metrics];
            if (next.length > 20) return next.slice(next.length - 20);
            return next;
          });
          
          if (payload.anomalies && payload.anomalies.length > 0) {
            setAnomalies(prev => {
              // Prepend new anomalies, keep last 10 unique ones
              const next = [...payload.anomalies, ...prev];
              // Use a map to ensure uniqueness by ID
              const unique = Array.from(new Map(next.map(item => [item.id, item])).values());
              return unique.slice(0, 10);
            });
          }
        }
      } catch (e) {
        console.error('Error parsing WS message', e);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [url]);

  return {
    currentData: dataHistory[dataHistory.length - 1] || null,
    dataHistory,
    anomalies,
    isConnected
  };
}
