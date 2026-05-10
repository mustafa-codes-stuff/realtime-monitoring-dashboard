import { BrainCircuit, Loader2, Target, AlertCircle, Lightbulb } from 'lucide-react';

/**
 * ExplanationPanel Component
 * 
 * Displays the AI-generated analysis of a selected metric anomaly.
 * Features a skeleton/loading state while fetching data from the Claude API.
 */
export default function ExplanationPanel({ explanation, loading, selectedAnomaly }) {
  // Empty state when no anomaly is selected
  if (!selectedAnomaly) {
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 flex flex-col h-full items-center justify-center p-8 text-center">
        <BrainCircuit className="w-16 h-16 text-gray-700 mb-4" />
        <h3 className="text-lg font-medium text-gray-300">AI Explanation Engine</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">
          Select an anomaly from the panel to generate a plain-English explanation of the root cause, impact, and recommended fix using Claude 3.5 Sonnet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">AI Analysis</h2>
        </div>
        <span className="text-xs font-mono text-indigo-300 bg-indigo-900/30 px-2 py-1 rounded">
          {selectedAnomaly.metric} @ {new Date(selectedAnomaly.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center h-full text-indigo-400 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="text-sm animate-pulse">Analyzing metrics context...</p>
          </div>
        ) : explanation ? (
          // Success State - Displaying the structured AI response
          <div className="space-y-6">
            <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg">
              <h3 className="text-red-400 font-semibold flex items-center gap-2 mb-2 text-sm uppercase tracking-wider">
                <Target className="w-4 h-4" /> Likely Cause
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">{explanation.likelyCause}</p>
            </div>

            <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-lg">
              <h3 className="text-blue-400 font-semibold flex items-center gap-2 mb-2 text-sm uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" /> Impact
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">{explanation.impact}</p>
            </div>

            <div className="bg-green-900/20 border border-green-900/50 p-4 rounded-lg">
              <h3 className="text-green-400 font-semibold flex items-center gap-2 mb-2 text-sm uppercase tracking-wider">
                <Lightbulb className="w-4 h-4" /> Recommendation
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">{explanation.recommendation}</p>
            </div>
          </div>
        ) : (
           <div className="text-red-400 text-sm text-center py-8">
             Failed to generate explanation. Please check your API key and network connection.
           </div>
        )}
      </div>
    </div>
  );
}
