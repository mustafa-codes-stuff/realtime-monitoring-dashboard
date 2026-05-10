import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function MetricCard({ title, value, unit = '', isAnomaly = false }) {
  return (
    <div className={`p-4 rounded-xl border transition-colors duration-300 ${isAnomaly ? 'bg-amber-900/20 border-amber-500/50' : 'bg-gray-900/50 border-gray-800'}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <Activity className={`w-4 h-4 ${isAnomaly ? 'text-amber-500' : 'text-blue-500'}`} />
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-3xl font-bold ${isAnomaly ? 'text-amber-400' : 'text-white'}`}>
          {value !== undefined ? value : '--'}{unit}
        </span>
      </div>
    </div>
  );
}
