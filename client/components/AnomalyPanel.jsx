import { AlertTriangle, ChevronRight } from 'lucide-react';

export default function AnomalyPanel({ anomalies, onExplain, selectedAnomalyId }) {
  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-white">Detected Anomalies</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {anomalies.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No anomalies detected recently. System is stable.
          </div>
        ) : (
          anomalies.map((anomaly) => (
            <div 
              key={anomaly.id} 
              className={`p-4 rounded-lg border transition-colors ${
                selectedAnomalyId === anomaly.id 
                  ? 'bg-amber-900/30 border-amber-500' 
                  : 'bg-black/40 border-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-amber-400 font-semibold uppercase text-sm tracking-wider">
                    {anomaly.metric} Spike
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(anomaly.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{anomaly.currentValue}</div>
                  <div className="text-xs text-gray-400">Avg: {anomaly.average}</div>
                </div>
              </div>
              <button 
                onClick={() => onExplain(anomaly)}
                className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors"
              >
                Explain with AI <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
